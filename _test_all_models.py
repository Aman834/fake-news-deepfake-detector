import asyncio
import sys
import numpy as np
import cv2
import json

sys.path.insert(0, ".")

from models.fake_news_model import FakeNewsModel
from models.image_model import ImageModel
from models.deepfake_model import DeepfakeModel

async def test():
    results = {}

    # TEST TEXT MODEL
    text_model = FakeNewsModel()
    await text_model.initialize()
    res1 = await text_model.predict("Aliens land in New York! The government is hiding them in Central Park underground bunkers.")
    res2 = await text_model.predict("The central bank announced a new interest rate policy today to tackle inflation.")
    results['text'] = {'fake_news': res1, 'real_news': res2}

    # TEST IMAGE MODEL
    img_model = ImageModel()
    solid = np.full((480, 640, 3), 128, dtype=np.uint8)
    r1 = await img_model.predict(solid)
    noise = np.random.randint(0, 255, (480, 640, 3), dtype=np.uint8)
    r2 = await img_model.predict(noise)
    grad = np.zeros((480, 640, 3), dtype=np.uint8)
    for i in range(480):
        grad[i, :, :] = [int(i/480*255), int(i/480*180), int(i/480*100)]
    r3 = await img_model.predict(grad)
    results['image'] = {'solid': r1, 'noise': r2, 'gradient': r3}

    # TEST VIDEO MODEL
    df_model = DeepfakeModel()
    f1 = await df_model.predict_frame(noise)
    f2 = await df_model.predict_frame(solid)
    results['video'] = {'noise': f1, 'solid': f2}

    with open("_results.json", "w", encoding="utf-8") as f:
        json.dump(results, f, indent=2)

asyncio.run(test())
