import React,{useState} from 'react'
import { useNavigate, Link } from 'react-router'
import "../auth.form.scss"
import { useAuth } from '../hooks/useAuth'

const Register = () => {

    const navigate = useNavigate()
    const [ username, setUsername ] = useState("")
    const [ email, setEmail ] = useState("")
    const [ password, setPassword ] = useState("")

    const {loading,handleRegister} = useAuth()
    
    const handleSubmit = async (e) => {
        e.preventDefault()
        await handleRegister({username,email,password})
        navigate("/")
    }

    if(loading){
        return (
            <main className="register-page">
                <div className="auth-bg-grid" aria-hidden="true">
                    {[...Array(12)].map((_, index) => (
                        <span key={index} className="bg-square" />
                    ))}
                </div>
                <div className="register-card register-loading">
                    <div className="register-spinner" />
                </div>
            </main>
        )
    }

    return (
        <main className="register-page">
            <div className="auth-bg-grid" aria-hidden="true">
                {[...Array(12)].map((_, index) => (
                    <span key={index} className="bg-square" />
                ))}
            </div>
            <section className="register-card" aria-label="Register form">
                <header className="register-header">
                    <span className="register-badge">CREATE ACCOUNT</span>
                    <h1>Join Intely</h1>
                    <p>Start building focused interview plans in minutes.</p>
                </header>

                <form onSubmit={handleSubmit} className="register-form">
                    <div className="register-field">
                        <label htmlFor="username">Username</label>
                        <input
                            onChange={(e) => { setUsername(e.target.value) }}
                            value={username}
                            type="text"
                            id="username"
                            name='username'
                            placeholder='Enter username'
                            autoComplete="off"
                            required
                        />
                    </div>

                    <div className="register-field">
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

                    <div className="register-field">
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

                    <button className='register-submit' type="submit">Create Account</button>
                </form>

                <p className="register-footer">Already have an account? <Link to={"/login"} className="register-link">Sign in</Link></p>
            </section>
        </main>
    )
}

export default Register