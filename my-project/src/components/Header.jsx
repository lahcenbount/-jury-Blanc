import React from 'react';

function Header() {
  return (
    <header className="bg-blue-300 text-white p-4 shadow-md w-full">
      <div className="container mx-auto flex flex-col items-end"> {/* Stack items vertically and align to the right */}
        <h1 className="text-2xl font-bold text-right">ConstructionXpert</h1> {/* Right-aligned text */}
        <h1 className=" text-sm md:text-base text-right">Gestion de projets de construction</h1> {/* Right-aligned text */}
      </div>
    </header>
  );
}

export default Header;
