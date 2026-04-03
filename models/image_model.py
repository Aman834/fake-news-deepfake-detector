"""
Image Manipulation & AI-Generation Detection Model
Detects BOTH traditional manipulation AND AI-generated images.
Uses: ELA, noise residual analysis, frequency spectrum analysis,
texture regularity, gradient smoothness, color distribution analysis.
"""

import logging
import io
import cv2
import numpy as np
from typing import Dict
from PIL import Image

logger = logging.getLogger(__name__)


class ImageModel:
    """Detects manipulated AND AI-generated images using forensic heuristics."""

    def __init__(self):
        self.input_size = (224, 224)
        self._initialized = False

    async def initialize(self):
        if self._initialized:
            return
        self._initialized = True
        logger.info("✅ Image forensic model initialized (ELA + AI detection)")

    async def predict(self, image: np.ndarray) -> Dict:
        if not self._initialized:
            await self.initialize()

        h, w = image.shape[:2]

        # --- Traditional manipulation detection ---
        ela_score = self._ela_analysis(image)
        noise_incon = self._noise_inconsistency(image)
        compression_score = self._compression_artifacts(image)

        # --- AI-generation detection ---
        ai_noise = self._ai_noise_residual(image)
        ai_freq = self._ai_frequency_analysis(image)
        ai_texture = self._ai_texture_regularity(image)
        ai_gradient = self._ai_gradient_smoothness(image)
        ai_color = self._ai_color_distribution(image)
        ai_saturation = self._ai_saturation_analysis(image)

        # Traditional manipulation score (toned down due to jpeg artifacts)
        manip_score = (
            ela_score * 0.35 +
            noise_incon * 0.35 +
            compression_score * 0.30
        ) * 0.85

        # AI generation score — use boosted weights
        ai_score = (
            ai_noise * 0.18 +
            ai_freq * 0.18 +
            ai_texture * 0.18 +
            ai_gradient * 0.18 +
            ai_color * 0.14 +
            ai_saturation * 0.14
        )
        # Tone down AI score aggressively to prevent false positives on real photos.
        ai_score = min(ai_score * 0.80, 0.98)

        # Final: take the MAX of both — image is fake if EITHER method flags it
        manipulated_prob = max(manip_score, ai_score)

        manipulated_prob = float(np.clip(manipulated_prob, 0.02, 0.98))
        authentic_prob = 1.0 - manipulated_prob
        prediction = "Manipulated" if manipulated_prob > 0.5 else "Authentic"
        confidence = max(manipulated_prob, authentic_prob)

        # Determine dominant detection type
        if ai_score > manip_score and ai_score > 0.4:
            detection_detail = "AI-Generated Content Detected"
        elif manip_score > 0.4:
            detection_detail = "Traditional Manipulation Detected"
        else:
            detection_detail = "No significant manipulation detected"

        manipulation_types = self._classify_type(
            ela_score, noise_incon, ai_noise, ai_freq, ai_texture,
            ai_gradient, manip_score, ai_score, manipulated_prob
        )

        return {
            "prediction": prediction,
            "confidence": round(confidence, 4),
            "manipulated_probability": round(manipulated_prob, 4),
            "authentic_probability": round(authentic_prob, 4),
            "manipulation_types": manipulation_types,
            "model": "forensic-ela-ai-detector",
            "detection_detail": detection_detail,
            "image_dimensions": {
                "width": w, "height": h,
                "channels": image.shape[2] if len(image.shape) > 2 else 1
            },
            "forensic_scores": {
                "ela": round(ela_score, 4),
                "noise_inconsistency": round(noise_incon, 4),
                "compression": round(compression_score, 4),
                "ai_noise_residual": round(ai_noise, 4),
                "ai_frequency": round(ai_freq, 4),
                "ai_texture": round(ai_texture, 4),
                "ai_gradient": round(ai_gradient, 4),
                "ai_color": round(ai_color, 4),
                "ai_saturation": round(ai_saturation, 4),
                "traditional_score": round(manip_score, 4),
                "ai_generation_score": round(ai_score, 4),
            }
        }

    # ====== Traditional Manipulation Detection ======

    def _ela_analysis(self, image: np.ndarray) -> float:
        """Error Level Analysis for splice/edit detection."""
        try:
            rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
            pil_img = Image.fromarray(rgb)
            buf = io.BytesIO()
            pil_img.save(buf, format='JPEG', quality=90)
            buf.seek(0)
            recomp = np.array(Image.open(buf)).astype(np.float64)
            orig = np.array(pil_img).astype(np.float64)
            diff = np.abs(orig - recomp)

            mean_d = np.mean(diff)
            h, w = diff.shape[:2]
            bs = max(h, w) // 4
            if bs > 10:
                block_stds = []
                for i in range(0, h - bs, bs):
                    for j in range(0, w - bs, bs):
                        block_stds.append(np.std(diff[i:i+bs, j:j+bs]))
                spatial_var = np.std(block_stds) if block_stds else 0
            else:
                spatial_var = 0

            score = np.clip(mean_d / 20.0, 0, 0.3) + np.clip(spatial_var / 8.0, 0, 0.5)
            return float(np.clip(score, 0.02, 0.95))
        except Exception as e:
            logger.debug(f"ELA error: {e}")
            return 0.15

    def _noise_inconsistency(self, image: np.ndarray) -> float:
        """Check noise uniformity across regions."""
        try:
            gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY) if len(image.shape) == 3 else image
            blurred = cv2.GaussianBlur(gray, (5, 5), 0)
            noise = gray.astype(np.float64) - blurred.astype(np.float64)
            h, w = noise.shape
            bs = max(32, min(h, w) // 6)
            levels = []
            for i in range(0, h - bs, bs):
                for j in range(0, w - bs, bs):
                    levels.append(np.std(noise[i:i+bs, j:j+bs]))
            if len(levels) < 2:
                return 0.10
            arr = np.array(levels)
            var = np.std(arr) / (np.mean(arr) + 1e-6)
            return float(np.clip((var - 0.15) / 0.7, 0.02, 0.95))
        except:
            return 0.10

    def _compression_artifacts(self, image: np.ndarray) -> float:
        """Detect double JPEG compression."""
        try:
            gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY) if len(image.shape) == 3 else image
            h, w = gray.shape
            boundary, non_boundary = [], []
            for i in range(8, h - 8, 8):
                boundary.append(np.mean(np.abs(np.diff(gray[i-1:i+1, :].astype(np.float64), axis=0))))
            for i in range(4, h - 4, 8):
                non_boundary.append(np.mean(np.abs(np.diff(gray[i-1:i+1, :].astype(np.float64), axis=0))))
            if boundary and non_boundary:
                ratio = np.mean(boundary) / (np.mean(non_boundary) + 1e-6)
                return float(np.clip((ratio - 1.0) / 0.5, 0.02, 0.85))
            return 0.10
        except:
            return 0.10

    # ====== AI-Generation Detection ======

    def _ai_noise_residual(self, image: np.ndarray) -> float:
        """
        Real camera photos have spatially correlated sensor noise.
        AI-generated images have no sensor noise — their noise residual
        is either too clean or unnaturally uniform.
        """
        try:
            gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY) if len(image.shape) == 3 else image
            gray_f = gray.astype(np.float64)

            # Extract noise residual via denoising
            denoised = cv2.GaussianBlur(gray, (7, 7), 1.5)
            noise = gray_f - denoised.astype(np.float64)

            noise_std = np.std(noise)
            noise_mean = np.mean(np.abs(noise))

            # Real camera noise: std ~2-8, spatially structured
            # AI noise: std < 1.5 (too clean) or very uniform

            # Check spatial autocorrelation of noise
            # Real sensor noise has spatial correlation; AI noise doesn't
            h, w = noise.shape
            if h > 10 and w > 10:
                center = noise[2:-2, 2:-2]
                shifted = noise[4:, 4:]
                min_h, min_w = min(center.shape[0], shifted.shape[0]), min(center.shape[1], shifted.shape[1])
                if min_h > 0 and min_w > 0:
                    corr = np.corrcoef(center[:min_h, :min_w].flatten(), shifted[:min_h, :min_w].flatten())[0, 1]
                else:
                    corr = 0
            else:
                corr = 0

            # Kurtosis of noise — real camera noise is near-Gaussian (kurtosis ~3)
            # AI noise may have different distribution
            noise_flat = noise.flatten()
            mean_n = np.mean(noise_flat)
            std_n = np.std(noise_flat) + 1e-10
            kurtosis = np.mean(((noise_flat - mean_n) / std_n) ** 4)

            score = 0.0

            # Too clean (very low noise) — suggests AI generation
            if noise_std < 1.5:
                score += 0.50
            elif noise_std < 3.0:
                score += 0.35
            elif noise_std < 5.0:
                score += 0.20

            # Low spatial correlation — suggests AI (real sensors have correlated noise)
            if abs(corr) < 0.08:
                score += 0.30
            elif abs(corr) < 0.20:
                score += 0.15

            # Unusual kurtosis
            if kurtosis < 2.5 or kurtosis > 5.0:
                score += 0.20

            return float(np.clip(score, 0.02, 0.95))
        except Exception as e:
            logger.debug(f"AI noise analysis error: {e}")
            return 0.15

    def _ai_frequency_analysis(self, image: np.ndarray) -> float:
        """
        AI-generated images have characteristic frequency fingerprints:
        - GANs: periodic artifacts, spectral peaks
        - Diffusion models: missing certain high-frequency details
        - Both: abnormal energy distribution across frequencies
        """
        try:
            gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY) if len(image.shape) == 3 else image
            gray = cv2.resize(gray, (256, 256))

            f = np.fft.fft2(gray.astype(np.float64))
            fshift = np.fft.fftshift(f)
            mag = np.log1p(np.abs(fshift))

            # Radial frequency analysis
            center = mag.shape[0] // 2
            radial_energy = []
            for r in range(5, center, 3):
                y, x = np.ogrid[-center:256-center, -center:256-center]
                mask = (x*x + y*y >= (r-2)**2) & (x*x + y*y < (r+2)**2)
                if np.sum(mask) > 0:
                    radial_energy.append(np.mean(mag[mask]))

            if len(radial_energy) < 5:
                return 0.10

            re = np.array(radial_energy)

            # Natural images: smooth monotonically decreasing energy
            # AI images: unusual bumps, plateaus, or sudden drops

            # Check smoothness of radial energy falloff
            diffs = np.diff(re)
            # Count positive diffs (energy should decrease = negative diffs)
            increasing_count = np.sum(diffs > 0.1)
            total_diffs = len(diffs)
            increase_ratio = increasing_count / total_diffs if total_diffs > 0 else 0

            # Check if high frequencies are abnormally weak (diffusion models)
            if len(re) > 10:
                low_energy = np.mean(re[:len(re)//3])
                high_energy = np.mean(re[-len(re)//3:])
                energy_ratio = high_energy / (low_energy + 1e-6)
            else:
                energy_ratio = 0.5

            # Check for periodic peaks (GAN fingerprints)
            detrended = re - np.convolve(re, np.ones(5)/5, mode='same')
            peak_strength = np.max(np.abs(detrended)) / (np.std(re) + 1e-6)

            score = 0.0

            # Non-monotonic frequency falloff
            if increase_ratio > 0.3:
                score += 0.35
            elif increase_ratio > 0.15:
                score += 0.15

            # Weak high frequencies (diffusion models lose detail)
            if energy_ratio < 0.15:
                score += 0.30
            elif energy_ratio < 0.25:
                score += 0.15

            # Periodic peaks (GAN artifacts)
            if peak_strength > 3.0:
                score += 0.30
            elif peak_strength > 2.0:
                score += 0.15

            return float(np.clip(score, 0.02, 0.95))
        except Exception as e:
            logger.debug(f"AI frequency error: {e}")
            return 0.15

    def _ai_texture_regularity(self, image: np.ndarray) -> float:
        """
        AI images often have unnaturally regular micro-textures.
        Real photos have irregular, organic texture patterns from the physical world.
        """
        try:
            gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY) if len(image.shape) == 3 else image
            gray = cv2.resize(gray, (256, 256))

            # Compute Local Binary Pattern-like features manually
            h, w = gray.shape
            gray_f = gray.astype(np.float64)

            # Compute variance of local gradients in small patches
            patch_size = 16
            local_vars = []
            local_entropies = []

            for i in range(0, h - patch_size, patch_size):
                for j in range(0, w - patch_size, patch_size):
                    patch = gray_f[i:i+patch_size, j:j+patch_size]
                    # Gradient magnitude
                    gx = np.diff(patch, axis=1)
                    gy = np.diff(patch, axis=0)
                    grad_mag = np.mean(np.abs(gx[:gx.shape[0], :])) + np.mean(np.abs(gy[:, :gy.shape[1]]))
                    local_vars.append(grad_mag)

                    # Local entropy
                    hist, _ = np.histogram(patch.astype(np.uint8), bins=16, range=(0, 256))
                    hist = hist / (hist.sum() + 1e-10)
                    nz = hist[hist > 0]
                    ent = -np.sum(nz * np.log2(nz + 1e-10))
                    local_entropies.append(ent)

            if len(local_vars) < 4:
                return 0.10

            vars_arr = np.array(local_vars)
            ent_arr = np.array(local_entropies)

            # --- KEY INSIGHT ---
            # Real photos: high variance in texture complexity (some areas detailed, some smooth)
            # AI images: more uniform texture complexity (everything has similar detail level)
            texture_uniformity = 1.0 - (np.std(vars_arr) / (np.mean(vars_arr) + 1e-6))
            entropy_uniformity = 1.0 - (np.std(ent_arr) / (np.mean(ent_arr) + 1e-6))

            score = 0.0

            # High uniformity suggests AI
            if texture_uniformity > 0.6:
                score += 0.45
            elif texture_uniformity > 0.4:
                score += 0.25
            elif texture_uniformity > 0.2:
                score += 0.10

            if entropy_uniformity > 0.6:
                score += 0.35
            elif entropy_uniformity > 0.4:
                score += 0.20

            # Very low mean gradient also suggests AI (over-smooth)
            if np.mean(vars_arr) < 5.0:
                score += 0.25
            elif np.mean(vars_arr) < 8.0:
                score += 0.12

            return float(np.clip(score, 0.02, 0.95))
        except Exception as e:
            logger.debug(f"AI texture error: {e}")
            return 0.15

    def _ai_gradient_smoothness(self, image: np.ndarray) -> float:
        """
        AI images produce unnaturally smooth color gradients.
        Real images have micro-variations from sensor noise and optics.
        """
        try:
            img = cv2.resize(image, (256, 256))

            # For each channel, check gradient smoothness
            smoothness_scores = []
            for ch in range(3):
                channel = img[:, :, ch].astype(np.float64)

                # Compute second derivative (Laplacian)
                lap = cv2.Laplacian(channel, cv2.CV_64F)
                lap_std = np.std(lap)

                # Compute gradient
                gx = cv2.Sobel(channel, cv2.CV_64F, 1, 0, ksize=3)
                gy = cv2.Sobel(channel, cv2.CV_64F, 0, 1, ksize=3)
                grad_mag = np.sqrt(gx**2 + gy**2)

                # In smooth gradient regions, grad_mag is moderate but lap is low
                # Check the ratio
                grad_mean = np.mean(grad_mag)
                if grad_mean > 1.0:
                    smoothness = lap_std / grad_mean
                else:
                    smoothness = lap_std

                smoothness_scores.append(smoothness)

            avg_smoothness = np.mean(smoothness_scores)

            # Real photos: smoothness ratio ~2.0-4.0 (noisy gradients)
            # AI images: smoothness ratio < 1.5 (too-perfect gradients)
            if avg_smoothness < 0.6:
                score = 0.75
            elif avg_smoothness < 1.0:
                score = 0.60
            elif avg_smoothness < 1.5:
                score = 0.45
            elif avg_smoothness < 2.0:
                score = 0.25
            elif avg_smoothness < 2.5:
                score = 0.10
            else:
                score = 0.05

            return float(np.clip(score, 0.02, 0.95))
        except Exception as e:
            logger.debug(f"AI gradient error: {e}")
            return 0.15

    def _ai_color_distribution(self, image: np.ndarray) -> float:
        """
        AI-generated images have characteristic color distributions:
        - More saturated/vivid than typical camera photos
        - Smoother histogram with fewer gaps
        - Different color co-occurrence patterns
        """
        try:
            img = cv2.resize(image, (256, 256))
            hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)

            # Hue histogram
            hue_hist = cv2.calcHist([hsv], [0], None, [180], [0, 180]).flatten()
            hue_hist = hue_hist / (hue_hist.sum() + 1e-10)

            # Saturation histogram
            sat_hist = cv2.calcHist([hsv], [1], None, [256], [0, 256]).flatten()
            sat_hist = sat_hist / (sat_hist.sum() + 1e-10)

            # Value histogram
            val_hist = cv2.calcHist([hsv], [2], None, [256], [0, 256]).flatten()
            val_hist = val_hist / (val_hist.sum() + 1e-10)

            score = 0.0

            # Smoothness of histogram (AI images have smoother histograms)
            hue_smoothness = np.std(np.diff(hue_hist))
            sat_smoothness = np.std(np.diff(sat_hist))

            # Very smooth hue distribution (unnatural)
            if hue_smoothness < 0.005:
                score += 0.30
            elif hue_smoothness < 0.008:
                score += 0.15

            # Count zero bins in saturation (real images have more gaps)
            sat_zeros = np.sum(sat_hist[10:240] < 1e-6)
            # Real photos: many zero bins (sparse histogram)
            # AI images: fewer zero bins (smoother distribution)
            if sat_zeros < 30:
                score += 0.30
            elif sat_zeros < 60:
                score += 0.15

            # Color entropy
            nz_sat = sat_hist[sat_hist > 0]
            sat_entropy = -np.sum(nz_sat * np.log2(nz_sat + 1e-10))
            # AI images tend to have higher color entropy (more evenly distributed)
            if sat_entropy > 6.5:
                score += 0.20
            elif sat_entropy > 6.0:
                score += 0.10

            # Check inter-channel correlation
            b, g, r = cv2.split(img)
            rg_corr = np.corrcoef(r.flatten(), g.flatten())[0, 1]
            gb_corr = np.corrcoef(g.flatten(), b.flatten())[0, 1]
            # Real photos: high inter-channel correlation (~0.85-0.98)
            # AI images: can have lower correlation
            avg_corr = (abs(rg_corr) + abs(gb_corr)) / 2
            if avg_corr < 0.75:
                score += 0.20
            elif avg_corr < 0.85:
                score += 0.10

            return float(np.clip(score, 0.02, 0.95))
        except Exception as e:
            logger.debug(f"AI color error: {e}")
            return 0.15

    def _ai_saturation_analysis(self, image: np.ndarray) -> float:
        """
        AI images often have specific saturation patterns that differ from camera photos.
        """
        try:
            hsv = cv2.cvtColor(cv2.resize(image, (256, 256)), cv2.COLOR_BGR2HSV)
            sat = hsv[:, :, 1].astype(np.float64)

            mean_sat = np.mean(sat)
            std_sat = np.std(sat)

            # Analyze saturation gradient smoothness
            sat_lap = cv2.Laplacian(sat, cv2.CV_64F)
            sat_lap_std = np.std(sat_lap)

            score = 0.0

            # AI images often have high average saturation (vibrant colors)
            if mean_sat > 130:
                score += 0.25
            elif mean_sat > 110:
                score += 0.10

            # Very smooth saturation transitions (AI characteristic)
            if sat_lap_std < 8.0:
                score += 0.30
            elif sat_lap_std < 15.0:
                score += 0.15

            # Unusual std/mean ratio
            ratio = std_sat / (mean_sat + 1e-6)
            if ratio < 0.3:
                score += 0.20
            elif ratio > 0.9:
                score += 0.10

            return float(np.clip(score, 0.02, 0.90))
        except:
            return 0.10

    # ====== Classification ======

    def _classify_type(self, ela, noise_incon, ai_noise, ai_freq, ai_texture,
                       ai_gradient, manip_score, ai_score, overall) -> list:
        types = []
        if overall < 0.3:
            return types

        if ai_score > manip_score:
            # AI generation detected
            if ai_freq > 0.3:
                types.append({
                    "type": "GAN/AI Generated",
                    "indicator": "Frequency spectrum anomalies consistent with AI generation",
                    "confidence": round(min(ai_freq + 0.15, 1.0), 4)
                })
            if ai_noise > 0.3:
                types.append({
                    "type": "Synthetic Image",
                    "indicator": "Missing natural camera sensor noise patterns",
                    "confidence": round(min(ai_noise + 0.10, 1.0), 4)
                })
            if ai_texture > 0.3:
                types.append({
                    "type": "AI-Generated Content",
                    "indicator": "Unnaturally uniform texture patterns",
                    "confidence": round(min(ai_texture + 0.10, 1.0), 4)
                })
            if ai_gradient > 0.3:
                types.append({
                    "type": "Diffusion Model Output",
                    "indicator": "Unnaturally smooth color gradients",
                    "confidence": round(min(ai_gradient + 0.10, 1.0), 4)
                })
        else:
            # Traditional manipulation
            if ela > 0.35:
                types.append({
                    "type": "Image Splicing",
                    "indicator": "Inconsistent error levels across regions",
                    "confidence": round(min(ela + 0.05, 1.0), 4)
                })
            if noise_incon > 0.35:
                types.append({
                    "type": "Copy-Move / Inpainting",
                    "indicator": "Noise level inconsistency between regions",
                    "confidence": round(min(noise_incon + 0.05, 1.0), 4)
                })

        if not types and overall > 0.3:
            types.append({
                "type": "Suspected Manipulation",
                "indicator": "Multiple weak forensic signals combined",
                "confidence": round(overall, 4)
            })

        return types
