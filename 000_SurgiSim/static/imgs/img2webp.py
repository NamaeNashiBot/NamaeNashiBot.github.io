import os
import argparse
from PIL import Image
import shutil
from concurrent.futures import ThreadPoolExecutor, as_completed

image_extensions = ['.jpg', '.jpeg', '.png', '.webp']

def process_webp(input_file, output_path, max_size):
    """
    Check if the WebP image exceeds the max size. If so, rename it to 
    `filename_original.webp` and return True. If not, return False.
    
    :param input_file: Path to the input WebP image
    :param max_size: Maximum allowed size in bytes
    :return: True if renamed, False otherwise
    """
    for ext in image_extensions[:-1]:
        if os.path.exists(input_file.replace('.webp', ext)) or os.path.exists(input_file.replace('.webp', '_original.webp')):
            return False # is a converted file
    
    if not input_file.endswith('_original.webp'):
        print(f"Copying {input_file} to {input_file.replace('.webp', '_original.webp')}...")
        shutil.copy2(input_file, input_file.replace('.webp', '_original.webp')) # backup original file
        convert_image_to_webp(input_file.replace('.webp', '_original.webp'), output_path, max_size)
        return True
    else:
        output_path = input_file.replace('_original.webp', '.webp')
        if os.path.exists(output_path) and os.path.getsize(output_path) <= max_size:
            print(f"Skipping {input_file} as {output_path} already exists and is under {max_size / 1024} KB.")
            return False
        convert_image_to_webp(input_file, output_path, max_size)
        return True

def convert_image_to_webp(input_file, output_file, max_size=1 * 1024 * 1024, force=False):
    """
    Convert an image to WebP format while ensuring the output file size 
    does not exceed the max_size (default: 1MB).
    
    :param input_file: Path to the input image file
    :param output_file: Path to the output WebP file
    :param max_size: Maximum allowed size in bytes (default is 1MB)
    :param force: Force convert the image even if it has been converted before
    """
    
    quality = 100  # Start with highest quality
    min_quality = 10  # Minimum quality to attempt
    
    fail_file = os.path.join(os.path.dirname(output_file), '.' + os.path.basename(output_file).replace('.webp', '.fail'))
    if os.path.exists(fail_file) and os.path.exists(output_file):
        with open(fail_file, 'r') as f:
            max_size_fail = int(f.readline())
            min_quality_fail = int(f.readline())
        if max_size_fail >= max_size and min_quality_fail <= min_quality: # no force if min_quality is the not lowered but failed
            print(f"Skipping {input_file} as {output_file} failed to compress under {max_size_fail / 1024} KB.")
            return
        else:
            os.remove(fail_file)
    
    try:
        # Load the image
        image = Image.open(input_file)
        
        # Save as WebP and progressively decrease the quality to fit the size limit
        while quality > min_quality:  # Set a reasonable lower bound for quality
            image.save(output_file, 'WEBP', quality=quality)
            
            # Check the output file size
            output_size = os.path.getsize(output_file)
            
            # If the output size is under the max_size, we're done
            if output_size <= max_size:
                print(f"File {output_file} successfully converted and size is {output_size / 1024} KB.")
                return
            
            # Otherwise, reduce the quality and try again
            quality -= 5  # Decrease quality by 5%
        
        # If we exit the loop, the file size couldn't be reduced enough
        print(f"Unable to reduce {input_file} to under {max_size / 1024} KB. Current size: {output_size / 1024} KB.")
        with open(fail_file, 'w') as f:
            f.write(f"{output_size}\n") # record the max size for future reference
            f.write(f"{min_quality}\n")
    except Exception as e:
        print(f"Error converting {input_file}: {e}")

def process_image(file_info):
    """
    Process a single image file, either converting or compressing it.
    
    :param file_info: Tuple (input_path, output_path, file_ext, max_size, force)
    """
    input_path, output_path, file_ext, max_size, force = file_info

    if file_ext == '.webp':
        # If already WebP, check size and rename if necessary
        for ext in image_extensions[:-1]:
            if os.path.exists(input_path.replace('.webp', ext)) or os.path.exists(input_path.replace('.webp', '_original.webp')):
                print(f"WebP {input_path} is a converted file, skipping...") 
                return 
            
        if not input_path.endswith('_original.webp'):
            print(f"Copying {input_path} to {input_path.replace('.webp', '_original.webp')}...")
            shutil.copy2(input_path, input_path.replace('.webp', '_original.webp')) # backup original file
            input_path = input_path.replace('.webp', '_original.webp')
        else:
            output_path = output_path.replace('_original.webp', '.webp')

    if os.path.exists(output_path) and os.path.getsize(output_path) <= max_size and not force:
        print(f"Skipping {input_path} as {output_path} already exists and is under {max_size / 1024} KB.")
    else:
        print(f"Converting {input_path} to {output_path}...")
        # Convert the image to WebP with size control
        convert_image_to_webp(input_path, output_path, max_size, force)

def batch_convert_images_to_webp(directory, max_size=1 * 1024 * 1024, num_threads=4, force=False):
    """
    Batch convert all supported image files in the given directory to WebP format using multithreading.
    
    :param directory: Path to the directory containing images
    :param max_size: Maximum allowed size in bytes (default is 1MB)
    :param num_threads: Number of threads to use for conversion
    :param force: Force convert all images
    """

    files_to_process = []

    # Traverse through all files in the given directory
    for root, _, files in os.walk(directory):
        for file in files:
            file_ext = os.path.splitext(file)[1].lower()

            # Check if the file is an image with a supported extension
            if file_ext in image_extensions:
                input_path = os.path.join(root, file)
                output_path = os.path.splitext(input_path)[0] + ".webp"

                # Collect the files to process
                files_to_process.append((input_path, output_path, file_ext, max_size, force))

    # Use ThreadPoolExecutor to process images in parallel
    with ThreadPoolExecutor(max_workers=num_threads) as executor:
        future_to_file = {executor.submit(process_image, file_info): file_info for file_info in files_to_process}

        for future in as_completed(future_to_file):
            try:
                future.result()  # We can handle any raised exceptions here if needed
            except Exception as exc:
                file_info = future_to_file[future]
                print(f"Error processing {file_info[0]}: {exc}")

if __name__ == "__main__":
    # Set up argparse to accept command-line arguments
    parser = argparse.ArgumentParser(description="Convert images in a directory to WebP format, ensuring file size is under 1MB.")
    
    # Argument for directory, default is the current directory
    parser.add_argument(
        'directory', 
        nargs='?', 
        default='./', 
        help='The directory containing images to convert (default is current directory).'
    )

    # Argument for the maximum size (optional), default is 1MB
    parser.add_argument(
        '--size', 
        type=str, 
        default="1 * 128 * 1024", 
        help='Maximum file size in bytes (default is 128KB).'
    )
    
    # Argument for number of threads
    parser.add_argument(
        '--threads', 
        type=int, 
        default=15, 
        help='Number of threads to use for conversion (default is 5).'
    )
    
    parser.add_argument(
        '--force', 
        action='store_true', 
        help='Force convert all images'
    )

    # Parse the arguments from the command line
    args = parser.parse_args()

    # Call the batch conversion function with the provided directory, max size, and number of threads
    batch_convert_images_to_webp(args.directory, eval(args.size), args.threads, args.force)
