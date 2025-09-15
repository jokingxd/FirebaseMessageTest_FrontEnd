/** @type {import('next').NextConfig} */
const nextConfig = {
 async rewrites() {
    return [
      {
        source: '/firebase-messaging-sw-dynamic.js',
        destination: '/api/firebase-sw', // your dynamic SW route
      },
    ];
  },
};

export default nextConfig;


//For non ES Modules (next.config.js)
// module.exports = {
//   async rewrites() {
//     return [
//       {
//         source: '/firebase-messaging-sw.js',
//         destination: '/api/firebase-sw',
//       },
//     ];
//   },
// };

