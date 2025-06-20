module.exports = function(eleventyConfig) {
  eleventyConfig.addPassthroughCopy("css"); // if you have CSS folder
  return {
    dir: {
      input: ".",
      includes: "_includes",
      output: "_site"
    }
  };
};
