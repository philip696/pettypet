'use client';

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-5xl font-bold text-white mb-4">🐾 PettyPet MVP</h1>
        <p className="text-xl text-white mb-8">
          Keep track of your pet&apos;s care and health records
        </p>
        <div className="space-x-4">
          <button className="bg-white text-primary px-6 py-2 rounded-lg font-semibold hover:bg-gray-100 transition">
            Sign In
          </button>
          <button className="border-2 border-white text-white px-6 py-2 rounded-lg font-semibold hover:bg-white hover:text-primary transition">
            Sign Up
          </button>
        </div>
      </div>
    </main>
  );
}
