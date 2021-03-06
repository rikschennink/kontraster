/**
 * Get a Promise for an image load state.
 *
 * @param {Image} image - The image to test.
 * @return Promise
 */
function imageOnLoad(image) {
  return new Promise((resolve, reject) => {
    if (image.complete) {
      resolve(image);
      return;
    }

    image.addEventListener('load', function imageOnLoadHandler() {
      image.removeEventListener('load', imageOnLoadHandler);
      resolve(image);
    });

    image.addEventListener('error', reject);
  });
}

module.exports = imageOnLoad;
