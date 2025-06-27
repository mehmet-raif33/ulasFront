

export default function Home() {

  return (
    <div className="p-20 bg-gray-100 min-h-screen flex flex-col items-center justify-center">
      <h1 className="text-3xl font-bold underline">
        Welcome to the Next.js App with Tailwind CSS!
      </h1>
      <p className="mt-4 text-lg">
        This is a simple example of a Next.js application styled with Tailwind CSS.
      </p>
      <button className="mt-6 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
        Click Me
      </button>
      <div className="mt-8">
        <p className="text-gray-700">
          This application is built using Next.js, a React framework for building server-rendered applications.
        </p>
        <p className="text-gray-700">
          Tailwind CSS is a utility-first CSS framework that allows you to build custom designs without leaving your HTML.
        </p>
        <p className="text-gray-300">
          With Tailwind CSS, you can create responsive layouts and design systems quickly and efficiently.
        </p>
      </div>
      </div>
  );
}

