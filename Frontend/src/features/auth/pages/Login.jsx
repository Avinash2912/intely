import React,{useState} from 'react'
import { useNavigate, Link } from 'react-router'
import "../auth.form.scss"
import { useAuth } from '../hooks/useAuth'

const Login = () => {

    const { loading, handleLogin } = useAuth()
    const navigate = useNavigate()

    const [ email, setEmail ] = useState("")
    const [ password, setPassword ] = useState("")

    const handleSubmit = async (e) => {
        e.preventDefault()
        await handleLogin({email,password})
        navigate('/')
    }

    if(loading){
        return (
            <main className="login-page">
                <div className="auth-bg-grid" aria-hidden="true">
                    {[...Array(12)].map((_, index) => (
                        <span key={index} className="bg-square" />
                    ))}
                </div>
                <div className="login-card login-loading">
                    <div className="login-spinner" />
                </div>
            </main>
        )
    }


    return (
        <main className="login-page">
            <div className="auth-bg-grid" aria-hidden="true">
                {[...Array(12)].map((_, index) => (
                    <span key={index} className="bg-square" />
                ))}
            </div>
            <section className="login-card" aria-label="Login form">
                <header className="login-header">
                    <span className="login-badge">INTELY</span>
                    <h1>Welcome back</h1>
                    <p>Sign in to continue your interview preparation.</p>
                </header>

                <form onSubmit={handleSubmit} className="login-form">
                    <div className="login-field">
                        <label htmlFor="email">Email</label>
                        <input
                            onChange={(e) => { setEmail(e.target.value) }}
                            value={email}
                            type="email"
                            id="email"
                            name='email'
                            placeholder='Enter email address'
                            autoComplete="off"
                            required
                        />
                    </div>

                    <div className="login-field">
                        <label htmlFor="password">Password</label>
                        <input
                            onChange={(e) => { setPassword(e.target.value) }}
                            value={password}
                            type="password"
                            id="password"
                            name='password'
                            placeholder='Enter password'
                            autoComplete="off"
                            required
                        />
                    </div>

                    <button className='login-submit' type="submit">Sign In</button>
                </form>

                <p className="login-footer">Don't have an account? <Link to={"/register"} className="login-link">Create one</Link></p>
            </section>
        </main>
    )
}

export default Login