module.exports = function(eleventyConfig) {
  // Treat markdown files in _posts as collection "post"
  eleventyConfig.addCollection("post", function(collection) {
    return collection.getFilteredByGlob("_posts/*.md");
  });

  return {
    dir: {
      input: ".",            // root is input
      includes: "_includes", // optional (use if you plan to use layouts)
      data: "_data",         // optional
      output: "CourseCove"   // final HTML output goes here
    }
  };
};
