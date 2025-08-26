'use client';

export default function NotFound() {
  return (
    <div className="w-full min-h-screen flex flex-col lg:flex-row items-center justify-center bg-white px-6 py-16 space-y-16 lg:space-y-0 lg:space-x-16">
      {/* Text Section */}
      <div className="w-full lg:w-1/2 flex flex-col items-center justify-center text-center">
        <p className="text-7xl md:text-8xl lg:text-9xl font-extrabold text-gray-300 tracking-wider">404</p>
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-700 mt-4">
          Không tìm thấy trang
        </h1>
        <p className="text-lg md:text-xl text-gray-500 mt-6 mb-10 max-w-xl">
        Rất tiếc, không tìm thấy trang bạn đang tìm kiếm. Có thể trang đó đã bị xóa, đổi tên hoặc không tồn tại.
        </p>
        <a
          href="/"
          className="flex items-center space-x-2 bg-[#D0201C] hover:bg-[#b31a18] text-white px-6 py-3 rounded transition duration-200"
          title="Return Home"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path
              fillRule="evenodd"
              d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z"
              clipRule="evenodd"
            />
            </svg>
            <span>Trở lại trang chủ</span>
        </a>
      </div>

      {/* Illustration Section */}
      <div className="w-full lg:w-1/2 flex items-center justify-center">
        <img
          src="/images/404/404-illustration.svg"
          alt="404 Illustration"
          className="max-w-full h-auto"
        />
      </div>
    </div>
  );
}
