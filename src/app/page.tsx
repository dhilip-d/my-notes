"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

export default function Home() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isDrawerOpen, setIsDrawerOpen] = useState(true); // Default closed on mobile
  const [theme, setTheme] = useState<"light" | "dark">("dark");
  const [isMounted, setIsMounted] = useState(false);

  const [notes, setNotes] = useState<string[]>([]);
  const [newNote, setNewNote] = useState("");
  
  // Added states for name and email
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  // Initialize theme and drawer state based on system preference and screen size
  useEffect(() => {
    setIsMounted(true);
    
    // Check for saved theme preference in localStorage
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark" || savedTheme === "light") {
      setTheme(savedTheme);
    } else {
      // If no saved preference, check system preference
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      setTheme(prefersDark ? "dark" : "light");
    }

    // Load saved notes from localStorage
    const savedNotes = localStorage.getItem("notes");
    if (savedNotes) {
      try {
        setNotes(JSON.parse(savedNotes));
      } catch (e) {
        console.error("Failed to parse saved notes:", e);
        localStorage.removeItem("notes"); // Clear invalid data
      }
    }
    
    // Load saved name and email from localStorage
    const savedName = localStorage.getItem("name");
    if (savedName) {
      setName(savedName);
    }
    
    const savedEmail = localStorage.getItem("email");
    if (savedEmail) {
      setEmail(savedEmail);
    }
    
    // Set drawer to open by default on larger screens
    const isLargeScreen = window.innerWidth >= 768;
    setIsDrawerOpen(isLargeScreen);
    
    // Add window resize listener for responsive drawer behavior
    const handleResize = () => {
      const isLargeScreen = window.innerWidth >= 768;
      
      if (isLargeScreen && !isDrawerOpen) {
        setIsDrawerOpen(true);
      } else if (!isLargeScreen && isDrawerOpen && isMounted) {
        // Only auto-close on small screens after initial mount
        setIsDrawerOpen(false);
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);  // Remove isDrawerOpen and isMounted from dependencies to fix the error

  // Apply theme to <html> and save preference
  useEffect(() => {
    if (!isMounted) return;
    
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    
    // Save theme preference
    localStorage.setItem("theme", theme);
  }, [theme, isMounted]);

  // Save notes to localStorage whenever they change
  useEffect(() => {
    if (isMounted) {
      localStorage.setItem("notes", JSON.stringify(notes));
    }
  }, [notes, isMounted]);

  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === "light" ? "dark" : "light");
  };

  const toggleDrawer = () => {
    setIsDrawerOpen(prev => !prev);
  };

  const handleAddNote = () => {
    if (newNote.trim()) {
      setNotes(prev => [...prev, newNote]);
      setNewNote("");
    }
  };

  const handleRemoveNote = (index: number) => {
    setNotes(prev => prev.filter((_, i) => i !== index));
  };

  // Handle saving name to localStorage
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value;
    setName(newName);
    localStorage.setItem("name", newName);
  };

  // Handle saving email to localStorage
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newEmail = e.target.value;
    setEmail(newEmail);
    localStorage.setItem("email", newEmail);
  };

  // Handler for tab changes
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    if (window.innerWidth < 768) {
      setIsDrawerOpen(false);
    }
  };

  // Prevent hydration mismatch by only rendering after mount
  if (!isMounted) {
    return null; // Or a simple loading state
  }

  return (
    <div className={`min-h-screen flex flex-col md:flex-row ${theme === "light" ? "bg-white text-gray-900" : "bg-gray-900 text-white"} transition-colors duration-300`}>
      {/* Mobile Header - Only visible on small screens */}
      <header className="md:hidden flex items-center justify-between p-4 shadow-md z-10 sticky top-0 bg-inherit">
        <div className="flex items-center">
          <button
            onClick={() => toggleDrawer()}
            className={`${theme === "light" ? "bg-gray-100 hover:bg-gray-200" : "bg-gray-800 hover:bg-gray-700"} p-2 rounded-full mr-3 transition-colors duration-200`}
            aria-label="Toggle menu"
          >
            {isDrawerOpen ? "✕" : "☰"}
          </button>
          <div className="flex items-center gap-2">
            <Image
              src="/sticky-notes.png"
              alt="App Logo"
              width={24}
              height={24}
              // className="dark:invert transition-all duration-300"
            />
            <h1 className="text-lg font-bold">Notes App</h1>
          </div>
        </div>
        <button
          onClick={() => toggleTheme()}
          className={`${theme === "light" ? "bg-gray-100 hover:bg-gray-200" : "bg-gray-800 hover:bg-gray-700"} p-2 rounded-full transition-colors duration-200`}
          aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
        >
          {theme === "light" ? "🌙" : "☀️"}
        </button>
      </header>

      {/* Drawer - Overlay on mobile */}
      {isDrawerOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-20"
          onClick={() => toggleDrawer()}
        />
      )}
      
      {/* Drawer - Fixed full height */}
      <aside
        className={`
          fixed md:relative z-30 md:z-auto
          ${isDrawerOpen ? "w-64 translate-x-0" : "w-0 -translate-x-full md:translate-x-0 md:w-64"} 
          ${theme === "light" ? "bg-white border-r border-gray-200 text-gray-900" : "bg-gray-800 text-white"} 
          shadow-md transition-all overflow-hidden duration-300
          inset-y-0 top-0 md:top-auto left-0 h-screen
        `}
      >
        <div className="p-4 md:p-6 h-full flex flex-col">
          {/* Logo - Hidden on mobile as it's in the header */}
          <div className="hidden md:flex items-center gap-2 mb-8">
            <Image
              src="/sticky-notes.png"
              alt="App Logo"
              width={36}
              height={36}
              // className="dark:invert transition-all duration-300"
            />
            <h1 className="text-xl font-bold">Notes App</h1>
          </div>
          
          {/* Close button - Only shown on mobile */}
          <div className="flex md:hidden items-center justify-between mb-6">
            <h2 className="text-lg font-bold">Menu</h2>
            <button 
              className="text-xl"
              onClick={() => toggleDrawer()}
            >
              ✕
            </button>
          </div>
          
          <nav className="flex flex-col gap-3 mt-4 md:mt-0 flex-grow">
            <button
              onClick={() => handleTabChange("dashboard")}
              className={`text-left px-3 py-2 rounded transition-colors duration-200
                ${activeTab === "dashboard" && theme === "light" && "bg-gray-100"}
                ${activeTab === "dashboard" && theme === "dark" && "bg-gray-700"}
                ${activeTab !== "dashboard" && theme === "light" && "hover:bg-gray-100"}
                ${activeTab !== "dashboard" && theme === "dark" && "hover:bg-gray-700"}
              `}
            >
              📊 Dashboard
            </button>

            <button
              onClick={() => handleTabChange("notes")}
              className={`text-left px-3 py-2 rounded transition-colors duration-200
                ${activeTab === "notes" && theme === "light" && "bg-gray-100"}
                ${activeTab === "notes" && theme === "dark" && "bg-gray-700"}
                ${activeTab !== "notes" && theme === "light" && "hover:bg-gray-100"}
                ${activeTab !== "notes" && theme === "dark" && "hover:bg-gray-700"}
              `}
            >
              📝 Create Notes
            </button>

            <button
              onClick={() => handleTabChange("settings")}
              className={`text-left px-3 py-2 rounded transition-colors duration-200
                ${activeTab === "settings" && theme === "light" && "bg-gray-100"}
                ${activeTab === "settings" && theme === "dark" && "bg-gray-700"}
                ${activeTab !== "settings" && theme === "light" && "hover:bg-gray-100"}
                ${activeTab !== "settings" && theme === "dark" && "hover:bg-gray-700"}
              `}
            >
              ⚙️ Settings
            </button>
          </nav>

          
          {/* Only show theme toggle on large screens, as it's in the header on mobile */}
          <div className="hidden md:block mt-6">
            <button
              onClick={() => toggleTheme()}
              className={`w-full text-left px-3 py-2 rounded ${theme === "light" ? "hover:bg-gray-100" : "hover:bg-gray-700"} transition-colors duration-200`}
            >
              {theme === "light" ? "🌙 Dark Mode" : "☀️ Light Mode"}
            </button>
          </div>
          
          <div className="mt-auto pt-4 text-sm text-gray-500 dark:text-gray-400">
            <p>Notes App v1.0</p>
          </div>
        </div>
      </aside>

      {/* Main Section */}
      <main className={`flex-1 p-4 md:p-6 lg:p-10 transition-all duration-300 ${theme === "light" ? "bg-gray-50 text-gray-900" : "bg-gray-900 text-white"} overflow-y-auto md:h-screen`}>
        {/* Removed the desktop header controls with the arrow button */}

        {/* Main Content */}
        {activeTab === "dashboard" && (
          <section className="transition-opacity duration-300 space-y-6">
            <h2 className="text-xl sm:text-2xl font-bold">📊 Welcome to Your Dashboard</h2>
            <p className="text-base">
              Access your notes, view analytics, and customize your profile here.
            </p>
            
            <div className={`p-4 ${theme === "light" ? "bg-white text-gray-900" : "bg-gray-800 text-white"} rounded-lg shadow-sm border ${theme === "light" ? "border-gray-200" : "border-gray-700"} transition-colors duration-300`}>
              <h3 className="text-lg font-semibold mb-2">Quick Stats</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                <div className={`p-3 pl-4 ${theme === "light" ? "bg-blue-50" : "bg-blue-900/30"} rounded-md`}>
                  <p className={`text-sm ${theme === "light" ? "text-gray-600" : "text-gray-300"}`}>Total Notes</p>
                  <p className="text-2xl font-bold">{notes.length}</p>
                </div>
                <div className={`p-3 pl-4 ${theme === "light" ? "bg-emerald-50" : "bg-emerald-900/30"} rounded-md`}>
                  <p className={`text-sm ${theme === "light" ? "text-gray-600" : "text-gray-300"}`}>Profile</p>
                  <p className="text-lg font-medium">{name ? "✅ Complete" : "❌ Incomplete"}</p>
                </div>
              </div>
            </div>

            {name && (
              <div className={`p-4 ${theme === "light" ? "bg-white text-gray-900" : "bg-gray-800 text-white"} rounded-lg shadow-sm border ${theme === "light" ? "border-gray-200" : "border-gray-700"} transition-colors duration-300`}>
                <h3 className="text-lg font-semibold mb-2">Welcome, {name}!</h3>
                {email && <p className={`text-sm ${theme === "light" ? "text-gray-600" : "text-gray-300"}`}>Logged in as: {email}</p>}
              </div>
            )}
          </section>
        )}

        {activeTab === "notes" && (
          <section className="transition-opacity duration-300 space-y-6">
            <h2 className="text-xl sm:text-2xl font-bold">📝 Create a New Note</h2>
            <div className="w-full">
              <textarea
                rows={6}
                className={`w-full p-3 sm:p-4 border rounded-lg ${theme === "light" ? "bg-white border-gray-300 text-gray-900" : "bg-gray-800 border-gray-700 text-white"} focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200`}
                placeholder="Write your note..."
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
              />
              <button
                className="mt-3 w-full sm:w-auto px-4 py-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600 text-white rounded transition-colors duration-200"
                onClick={() => handleAddNote()}
              >
                Add Note
              </button>
            </div>

            <h3 className="text-lg sm:text-xl font-semibold">🗂️ Your Notes</h3>
            <ul className="space-y-3 sm:space-y-4">
              {notes.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400">No notes yet. Create your first note above!</p>
              ) : (
                notes.map((note, index) => (
                  <li
                    key={index}
                    className={`p-3 sm:p-4 border rounded-lg ${theme === "light" ? "bg-white border-gray-200 text-gray-900" : "bg-gray-800 border-gray-700 text-white"} transition-colors duration-200 flex justify-between items-start`}
                  >
                    <div className="flex-1 pr-4 break-words">{note}</div>
                    <button 
                      onClick={() => handleRemoveNote(index)}
                      className="text-red-500 hover:text-red-700 dark:hover:text-red-400 p-1 rounded transition-colors duration-200 flex-shrink-0"
                      title="Remove note"
                      aria-label="Remove note"
                    >
                      🗑️
                    </button>
                  </li>
                ))
              )}
            </ul>
          </section>
        )}

        {activeTab === "settings" && (
          <section className="transition-opacity duration-300 space-y-6">
            <h2 className="text-xl sm:text-2xl font-bold">⚙️ Profile Settings</h2>

            <div className="space-y-4">
              <div>
                <label className="block mb-1 sm:mb-2 font-semibold">Name</label>
                <input
                  type="text"
                  placeholder="Your name"
                  value={name}
                  onChange={handleNameChange}
                  className={`w-full max-w-md p-2 sm:p-3 rounded border ${theme === "light" ? "bg-white border-gray-300 text-gray-900" : "bg-gray-800 border-gray-700 text-white"} focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200`}
                />
              </div>

              <div>
                <label className="block mb-1 sm:mb-2 font-semibold">Email</label>
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={handleEmailChange}
                  className={`w-full max-w-md p-2 sm:p-3 rounded border ${theme === "light" ? "bg-white border-gray-300 text-gray-900" : "bg-gray-800 border-gray-700 text-white"} focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200`}
                />
              </div>
            </div>

            <div className={`p-4 border rounded-lg ${theme === "light" ? "bg-white border-gray-200 text-gray-900" : "bg-gray-800 border-gray-700 text-white"} transition-colors duration-200`}>
              <h3 className="font-semibold mb-3">Appearance</h3>
              
              <div className="flex flex-col gap-3">
                <p className={`text-sm ${theme === "light" ? "text-gray-600" : "text-gray-400"}`}>Choose your preferred theme:</p>
                
                <div className="flex flex-wrap items-center gap-4">
                  <button 
                    onClick={() => setTheme("light")}
                    className={`flex items-center justify-center w-16 h-16 rounded-lg border-2 ${
                      theme === "light" 
                        ? "border-blue-500 bg-blue-50" 
                        : "border-gray-600"
                    } transition-colors duration-200`}
                    aria-label="Switch to light mode"
                  >
                    <span className="text-2xl">☀️</span>
                  </button>
                  
                  <button 
                    onClick={() => setTheme("dark")}
                    className={`flex items-center justify-center w-16 h-16 rounded-lg border-2 ${
                      theme === "dark" 
                        ? "border-blue-500 bg-blue-900/30" 
                        : "border-gray-300"
                    } transition-colors duration-200`}
                    aria-label="Switch to dark mode"
                  >
                    <span className="text-2xl">🌙</span>
                  </button>
                  
                  <button 
                    onClick={() => {
                      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
                      setTheme(prefersDark ? "dark" : "light");
                    }}
                    className={`px-3 py-2 text-sm ${theme === "light" ? "bg-gray-100 hover:bg-gray-200 text-gray-900" : "bg-gray-700 hover:bg-gray-600 text-white"} rounded transition-colors duration-200`}
                  >
                    System Default
                  </button>
                </div>
                
                <p className={`mt-2 text-sm ${theme === "light" ? "text-gray-500" : "text-gray-400"}`}>
                  Current theme: <span className="font-medium capitalize">{theme}</span>
                </p>
              </div>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
