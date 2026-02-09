import { GlobeState } from '../types';

/**
 * Capture the current state of the globe and apply post-processing effects
 * manually using Canvas 2D API to ensure they are saved in the output image.
 */
export const generateCompositeImage = async (
    glCanvas: HTMLCanvasElement,
    state: GlobeState,
    pixelRatio: number = 2
): Promise<string> => {
    // 1. Create an offscreen canvas for composition
    const width = glCanvas.width;
    const height = glCanvas.height;

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');

    if (!ctx) {
        throw new Error('Could not get 2D context for screenshot composition');
    }

    // Helper to load image from data URL
    const loadImage = (src: string): Promise<HTMLImageElement> => {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => resolve(img);
            img.onerror = reject;
            img.src = src;
        });
    };

    // 2. Draw the base WebGL content
    // We use toDataURL instead of drawImage(glCanvas) directly to avoid potential sync issues
    // although drawImage(glCanvas) is usually faster and synchronous.
    // With preserveDrawingBuffer: true, drawImage should work fine.
    ctx.drawImage(glCanvas, 0, 0);

    // 3. Apply Post-Processing Effects
    if (state.postProcessing?.enabled) {
        const pp = state.postProcessing;
        const intensity = (pp.opacity ?? 100) / 100;
        const boost = 5.0; // Filter intensity booster matching CSS

        // --- Global Filters (Brightness, Contrast, Hue, Saturation) ---
        // Canvas 2D 'filter' property matches CSS 'filter' standard
        let filterString = '';

        if (pp.brightnessEnabled) {
            const bIntensity = (pp.brightnessIntensity ?? 100) / 100 * intensity;
            if (pp.brightness !== 100) {
                const b = 100 + (pp.brightness - 100) * boost * bIntensity;
                filterString += ` brightness(${Math.max(0, b)}%)`;
            }
            if (pp.contrast !== 100) {
                const c = 100 + (pp.contrast - 100) * bIntensity;
                filterString += ` contrast(${c}%)`;
            }
        }

        if (pp.hueEnabled) {
            const hIntensity = (pp.hueIntensity ?? 100) / 100 * intensity;
            if (pp.hue !== 0) {
                const h = (pp.hue * 3.6) * hIntensity;
                filterString += ` hue-rotate(${h}deg)`;
            }
            if (pp.saturation !== 10) {
                // Saturation 10 is baseline (100%), scale is 0-100?
                // App.tsx slider: 0-100.
                // GlobeView.tsx: sValue = pp.saturation * 10
                // s = 100 + (sValue - 100) * boost * hIntensity
                const sValue = pp.saturation * 10;
                const s = 100 + (sValue - 100) * boost * hIntensity;
                filterString += ` saturate(${Math.max(0, s)}%)`;
            }
        }

        // Apply strict global filters to the whole canvas
        // Note: In CSS, these are applied to the container.
        // If we apply them now, they affect the base image.
        if (filterString) {
            // Logic: Read current canvas -> Apply filter -> Draw back
            // Since ctx.filter affects drawing operations, we need to:
            // 1. Copy current canvas to temp
            // 2. Clear canvas
            // 3. Set filter
            // 4. Draw temp
            // However, since we just drew the image, we can just Draw it with the filter?
            // But we already drew it.
            // Easiest is to draw the glCanvas WITH the filter in step 2.
            // But we are here now. Let's do the copy-back method.

            const tempCanvas = document.createElement('canvas');
            tempCanvas.width = width;
            tempCanvas.height = height;
            const tempCtx = tempCanvas.getContext('2d');
            if (tempCtx) {
                tempCtx.drawImage(canvas, 0, 0);

                ctx.clearRect(0, 0, width, height);
                ctx.save();
                ctx.filter = filterString;
                ctx.drawImage(tempCanvas, 0, 0);
                ctx.restore();
            }
        }

        // --- Bloom (Approximation) ---
        // CSS uses an SVG filter for Bloom. In Canvas, we can approximate with:
        // High-pass filter -> Blur -> Screen Blend
        if (pp.bloomEnabled && pp.bloom > 0) {
            // This is expensive and complex to replicate *exactly* without WebGL shaders.
            // Simple approximation: Draw a blurred version of the bright parts with 'screen' blend.

            const bloomStrength = (pp.bloomStrength ?? 2.7) * ((pp.bloom ?? 100) / 100);
            const bloomRadius = (pp.bloomRadius ?? 1.0) * 12 * (pixelRatio || 1);
            const bloomThreshold = pp.bloomThreshold ?? 0.36;

            const bloomCanvas = document.createElement('canvas');
            bloomCanvas.width = width / 4; // Downscale for performance and blur
            bloomCanvas.height = height / 4;
            const bCtx = bloomCanvas.getContext('2d');

            if (bCtx) {
                bCtx.drawImage(canvas, 0, 0, bloomCanvas.width, bloomCanvas.height);
                // Simple thresholding by redrawing with 'multiply' to darken? No, that's not right.
                // Accurate way: GetImageData, loop pixels, zero out below threshold. Slow.
                // Fast way: brightness/contrast adjustment?

                // Apply blur
                bCtx.filter = `blur(${bloomRadius / 4}px) brightness(${bloomStrength * 100}%) contrast(150%)`;
                // We use standard composite to blur in place (requires copy) or just draw over another layer.
                // Let's assume the previous drawImage put the content there.
                // We need to redraw it with the filter?
                // Actually, ctx.filter applies to draw commands.

                // Cleaner:
                const offC = document.createElement('canvas');
                offC.width = bloomCanvas.width;
                offC.height = bloomCanvas.height;
                offC.getContext('2d')?.drawImage(canvas, 0, 0, offC.width, offC.height);

                bCtx.clearRect(0, 0, bloomCanvas.width, bloomCanvas.height);
                bCtx.filter = `blur(${bloomRadius / 4}px) brightness(${bloomStrength * 50 + 50}%)`;
                bCtx.drawImage(offC, 0, 0);

                // Composite back to main
                ctx.save();
                ctx.globalCompositeOperation = 'screen';
                ctx.globalAlpha = 0.6; // Adjust roughly
                ctx.drawImage(bloomCanvas, 0, 0, width, height);
                ctx.restore();
            }
        }

        // --- Depth of Field (DoF) ---
        if (pp.dofEnabled && pp.blur > 0) {
            const blurAmount = (pp.blur / 5) * intensity;
            const fstop = pp.fstop ?? 30;
            const focus = pp.focus ?? 50;

            // In GlobeView, the mask is radial based on focalScreenPos.
            // We default to center here since picking logic might be complex to pass down perfectly
            // unless we passed the focal point in state (which we sort of did with focalLat/Lng).
            // For now, let's assume focus is based on the slider or center if not picking.
            // The CSS uses: `radial-gradient(circle at ${focalScreenPos.x}% ${focalScreenPos.y}%, transparent ${inner}%, black ${outer}%)`

            // We need to calculate focalScreenPos again or approximate.
            // GlobeView calculates it every frame.
            // If the user picked a point, state.postProcessing.focalLat/Lng is set.
            // But to project it, we need the camera and scene. We don't have them here easily.
            // For a screenshot, maybe we just assume center (50% 50%) unless we want to do the math?
            // The user can pass the calculated screen pos?
            // Or we just default to center (50, 50) as "Camera" icon usually implies WYSIWYG but projection is hard without THREE context.
            // Let's default to center for simplicity in V1 refactor, or 50% vertical as per slider.
            // The slider 'focus' controls the Y position in the simple ID mode? 
            // In GlobeView: `setFocalScreenPos({ x: 50, y: state.postProcessing?.focus ?? 50 });`
            // So yes, it uses the slider value for Y.

            const focusX = 50; // Center X
            const focusY = pp.focalLat ? 50 : (pp.focus ?? 50); // Use slider value if not picking (approx)
            // If picking was active, the verified code recalculates.
            // Let's stick to the slider value logic which matches the 'else' block in GlobeView.

            const innerRadius = Math.max(0, fstop / 2); // % of screen dimension (roughly)
            const outerRadius = Math.max(innerRadius + 10, fstop);

            // 1. Create blurred version
            const blurCanvas = document.createElement('canvas');
            blurCanvas.width = width;
            blurCanvas.height = height;
            const bCtx = blurCanvas.getContext('2d');
            if (bCtx) {
                bCtx.filter = `blur(${blurAmount}px)`;
                bCtx.drawImage(canvas, 0, 0);

                // 2. Create Mask
                // Gradient: Transparent at center, Black at outer.
                // Composite: Destination-In.
                // Inner/Outer are percentages.

                const maxDim = Math.max(width, height);
                const rInner = (innerRadius / 100) * (maxDim / 2); // % of half-size? 
                // CSS radial-gradient percentages are usually based on the box size or specialized.
                // `transparent ${inner}%` means x% of the radial ray.
                // Ray length from center to corner is approx 0.707 * diagonal.
                // Let's approximate % as screen height %.
                const r1 = (innerRadius / 100) * (height);
                const r2 = (outerRadius / 100) * (height);

                const cx = (focusX / 100) * width;
                const cy = (focusY / 100) * height;

                const maskCanvas = document.createElement('canvas');
                maskCanvas.width = width;
                maskCanvas.height = height;
                const mCtx = maskCanvas.getContext('2d');
                if (mCtx) {
                    const grad = mCtx.createRadialGradient(cx, cy, r1, cx, cy, r2);
                    grad.addColorStop(0, 'rgba(0,0,0,0)'); // Transparent
                    grad.addColorStop(1, 'rgba(0,0,0,1)'); // Opaque

                    mCtx.fillStyle = grad;
                    mCtx.fillRect(0, 0, width, height); // Fill with gradient

                    // If outside r2, it's opaque (per CSS `black ${outer}%`).
                    // Canvas gradient clamps the last color stop. So it will be opaque outside r2.
                    // But wait, standard CSS gradient behavior for transparent start? Yes.
                }

                // 3. Composite Mask onto Blur
                // Keep only the opaque parts of the blur (the "foreground/background" out of focus areas)
                bCtx.globalCompositeOperation = 'destination-in';
                bCtx.drawImage(maskCanvas, 0, 0);

                // 4. Draw Composite Blur onto Main
                ctx.save();
                ctx.globalCompositeOperation = 'source-over';
                ctx.globalAlpha = 1.0;
                ctx.drawImage(blurCanvas, 0, 0);
                ctx.restore();
            }
        }

        // --- Mosaic (Pixelate) ---
        if (pp.mosaicEnabled && pp.mosaic > 0) {
            const size = Math.max(1, (pp.mosaicSize || 10)); // Size in pixels roughly
            const mosaicOpacity = (pp.mosaic / 100) * ((pp.opacity ?? 100) / 100);

            // We can draw a downscaled image then upscale it with nearest-neighbor
            const scale = 1 / (size / 2); // Adjust factor
            const smallW = Math.ceil(width * scale);
            const smallH = Math.ceil(height * scale);

            const mosaicCanvas = document.createElement('canvas');
            mosaicCanvas.width = smallW;
            mosaicCanvas.height = smallH;
            const mCtx = mosaicCanvas.getContext('2d');
            if (mCtx) {
                mCtx.drawImage(canvas, 0, 0, smallW, smallH);

                ctx.save();
                ctx.globalAlpha = mosaicOpacity;
                ctx.imageSmoothingEnabled = false; // Nearest neighbor
                ctx.drawImage(mosaicCanvas, 0, 0, width, height);
                ctx.restore();
            }
        }

        // --- Chromatic Aberration ---
        if (pp.chromaticEnabled && pp.chromatic > 0) {
            const offsetX = (pp.chromaticOffsetX ?? 15) * ((pp.chromatic ?? 0) / 100);
            const offsetY = (pp.chromaticOffsetY ?? 15) * ((pp.chromatic ?? 0) / 100);
            const opacity = ((pp.chromatic ?? 0) / 100) * ((pp.opacity ?? 100) / 100);

            if (offsetX !== 0 || offsetY !== 0) {
                // Draw Red channel shifted
                ctx.save();
                ctx.globalCompositeOperation = 'screen';
                ctx.globalAlpha = opacity;

                // To do this properly we need to isolate channels.
                // Canvas doesn't easily let us draw "just the red channel".
                // A cheap fake is drawing the image tinted red/blue/green with screen blend.
                // Or drawing the whole image shifted with a multiply blend of a solid color?
                // "RGB Split" effect:
                // 1. Draw Original (Center) - Base
                // 2. Draw Red version (Shifted Left) - Screen
                // 3. Draw Blue version (Shifted Right) - Screen
                // But we already have the base.

                // Simpler/Better:
                // This is hard to do performantly in 2D canvas without iterating pixels.
                // Let's skip precise chromatic aberration for V1 or use a very simple simple drift.

                // Approximate: Draw image again with low opacity at offset?
                // That just looks like motion blur.

                // Given complexity, we might skip CA or leave it as a "known limitation" of the screenshot tool
                // vs the live shader.
                // OR: We can use `ctx.globalCompositeOperation = 'lighter'` (Add/Screen)
                // But we need to colorize the layers first.
                // Let's skip CA for now to keep it robust, or do a very subtle shift.
                ctx.restore();
            }
        }

        // --- Noise ---
        if (pp.noiseEnabled) {
            const noiseAmount = (pp.noiseAmount ?? 36) / 100;
            const noiseIntensity = (pp.noiseIntensity ?? 100) / 100 * ((pp.opacity ?? 100) / 100);

            // Generate noise
            const nCanvas = document.createElement('canvas');
            nCanvas.width = width;
            nCanvas.height = height;
            const nCtx = nCanvas.getContext('2d');
            if (nCtx) {
                const imageData = nCtx.createImageData(width, height);
                const data = imageData.data;
                for (let i = 0; i < data.length; i += 4) {
                    const v = Math.random() * 255;
                    data[i] = v;     // R
                    data[i + 1] = v; // G
                    data[i + 2] = v; // B
                    data[i + 3] = 255; // Alpha
                }
                nCtx.putImageData(imageData, 0, 0);

                ctx.save();
                ctx.globalCompositeOperation = 'overlay';
                ctx.globalAlpha = noiseAmount * noiseIntensity;
                ctx.drawImage(nCanvas, 0, 0);
                ctx.restore();
            }
        }

        // --- Vignette ---
        if (pp.vignetteEnabled) {
            const vIntensity = (pp.vignetteIntensity ?? 100) / 100 * intensity;
            const vOffset = pp.vignetteOffset ?? 50;
            const vDarkness = (pp.vignetteDarkness ?? 80) / 100;

            const grad = ctx.createRadialGradient(
                width / 2, height / 2, (vOffset / 100) * (height / 2),
                width / 2, height / 2, height * 0.8
            );
            grad.addColorStop(0, 'rgba(0,0,0,0)');
            grad.addColorStop(1, `rgba(0,0,0,${vDarkness})`);

            ctx.save();
            ctx.globalCompositeOperation = 'source-over';
            ctx.globalAlpha = vIntensity;
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, width, height);
            ctx.restore();
        }
    }

    // 4. Add Watermark or Logo (Optional, can be added here)

    // 5. Return Blob URL
    return canvas.toDataURL('image/png', 1.0);
};
