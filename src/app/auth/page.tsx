import LoginForm from "./LoginForm";
import RegisterForm from "./RegisterForm";

const AuthPage = () => {
  return (
    <div className="flex flex-col md:flex-row gap-8 justify-center items-start min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="w-full md:w-1/2">
        <LoginForm />
      </div>
      <div className="w-full md:w-1/2">
        <RegisterForm />
      </div>
    </div>
  );
};

export default AuthPage;