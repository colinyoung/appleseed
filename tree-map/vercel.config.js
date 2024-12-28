module.exports = {
  routes: [
    {
      src: '/',
      dest: '/index',
    },
    {
      src: '/api/tree-requests',
      dest: '/api/tree-requests',
      maxDuration: 30,
    },
  ],
};
