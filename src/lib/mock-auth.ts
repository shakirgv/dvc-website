import Cookies from "js-cookie";

export const MOCK_AUTH = {
  login: (userData: any) => {
    // Generate a mock DVC ID
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const dvcId = `DVC-2026-${randomNum}`;

    const isAdmin = userData.email === "admin@dvc.az";
    const session = {
      id: isAdmin ? "DVC-ADMIN-001" : dvcId,
      role: isAdmin ? "admin" : "user",
      ...userData,
      firstName: isAdmin ? "DVC" : userData.firstName,
      lastName: isAdmin ? "Admin" : userData.lastName,
      token: isAdmin ? "mock-admin-token-12345" : "mock-jwt-token-12345",
    };

    // Save in local storage for detailed profile use
    localStorage.setItem("dvc-mock-session", JSON.stringify(session));
    
    // Save token in cookie for middleware
    Cookies.set("auth-token", session.token, { expires: 7 });

    return session;
  },
  
  logout: () => {
    localStorage.removeItem("dvc-mock-session");
    Cookies.remove("auth-token");
  },
  
  getSession: () => {
    if (typeof window === "undefined") return null;
    const session = localStorage.getItem("dvc-mock-session");
    return session ? JSON.parse(session) : null;
  }
};
