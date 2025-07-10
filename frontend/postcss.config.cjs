module.exports = {
  plugins: [
    require('@tailwindcss/nesting')(require('postcss-nesting')),
    require('@tailwindcss/postcss'),
    require('autoprefixer')
  ]
}