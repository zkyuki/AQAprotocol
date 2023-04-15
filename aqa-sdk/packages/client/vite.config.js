const path = require("path");
const { defineConfig } = require("vite");

export default defineConfig({
  build: {
    lib: {
      entry: path.resolve(__dirname, 'lib/index.ts'),
      name: 'Client',
      fileName: 'client',
    },
  },
});
