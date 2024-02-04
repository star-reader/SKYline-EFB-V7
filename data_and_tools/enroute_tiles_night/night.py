import cv2
import numpy as np
from PIL import Image, ImageOps, ImageEnhance
import os
import glob
import time

current_airac = '2401'

def process_image(file_path, night_file_path):
    img = Image.open(file_path)
    if img.mode != 'RGB':
        img = img.convert('RGB')
    # 反色处理（反色5%代表保留原色95%，所以这里需要用255的95%）
    inverted_image = ImageOps.invert(img)
    # 调整对比度
    enhancer = ImageEnhance.Contrast(inverted_image)
    contrast_adjusted = enhancer.enhance(1.15)  # 提高对比度到115%
    # 将 PIL 图像转为 OpenCV 格式
    opencvImage = cv2.cvtColor(np.array(contrast_adjusted), cv2.COLOR_RGB2BGR)
    # 将图像从 BGR 转换为 HSV
    hsv = cv2.cvtColor(opencvImage, cv2.COLOR_BGR2HSV)
    # 对 hue channel 做变换，实现色调的旋转
    h, s, v = cv2.split(hsv)
    h = (h + 90) % 180  # 色调旋转180度
    hsv = cv2.merge([h, s, v])
    # 将图像从 HSV 转回 BGR
    final_img = cv2.cvtColor(hsv, cv2.COLOR_HSV2BGR)
    # 保存图像
    try:
        os.mkdir(os.path.dirname(new_files))
    except:
        pass
    cv2.imwrite(new_files, final_img)
    print(f'文件{new_files}保存完成')

def get_all_png_files(directory):
    search_path = os.path.join(directory, "**", "*.png")
    png_files = glob.glob(search_path, recursive=True)
    return png_files

png_files = get_all_png_files(f'{current_airac}/')
for file in png_files:
    new_files = file.replace(current_airac, f'{current_airac}_night')
    process_image(file, new_files)
    time.sleep(0.2)
