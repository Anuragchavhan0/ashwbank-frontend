import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import API from '../api/axios'

function Login() {
    const [email, setEmail]       = useState('')
    const [password, setPassword] = useState('')
    const [error, setError]       = useState('')
    const [loading, setLoading]   = useState(false)
    const { login } = useAuth()
    const navigate  = useNavigate()

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true); setError('')
        try {
            const res = await API.post('/api/auth/login', { email, password })
            login({
                name: res.data.name, email: res.data.email,
                accountNumber: res.data.accountNumber,
                balance: res.data.balance, accountType: res.data.accountType,
            }, res.data.token)
            navigate('/dashboard')
        } catch {
            setError('Invalid email or password. Please try again.')
        } finally { setLoading(false) }
    }

    return (
        <div style={s.page}>
            {/* LEFT PANEL */}
            <div style={s.left}>
                <div style={s.leftInner}>
                    <div style={s.badge}>🏦 Trusted Banking</div>
                    <h1 style={s.hero}>Your money,<br/>your control.</h1>
                    <p style={s.heroSub}>AshwBank gives you full control over your finances with instant transfers, real-time balance tracking, and secure JWT-protected accounts.</p>
                    <div style={s.stats}>
                        {[['₹0 Fees','On all transfers'],['256-bit','Encryption'],['24/7','Access']].map(([v,l])=>(
                            <div key={v} style={s.stat}>
                                <div style={s.statVal}>{v}</div>
                                <div style={s.statLabel}>{l}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* RIGHT PANEL */}
            <div style={s.right}>
                <div style={s.form}>
                    <div style={s.logo}>
                        <div style={s.logoMark}>A</div>
                        <span style={s.logoText}>AshwBank</span>
                    </div>

                    <h2 style={s.title}>Welcome back</h2>
                    <p style={s.sub}>Sign in to your account</p>

                    {error && (
                        <div style={s.error}>
                            <span>⚠️</span> {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        <div style={s.field}>
                            <label style={s.label}>Email address</label>
                            <input style={s.input} type="email"
                                placeholder="you@gmail.com"
                                value={email} onChange={e=>setEmail(e.target.value)} required/>
                        </div>
                        <div style={s.field}>
                            <label style={s.label}>Password</label>
                            <input style={s.input} type="password"
                                placeholder="••••••••"
                                value={password} onChange={e=>setPassword(e.target.value)} required/>
                        </div>
                        <button style={loading ? s.btnOff : s.btn} type="submit" disabled={loading}>
                            {loading ? 'Signing in...' : 'Sign In →'}
                        </button>
                    </form>

                    <div style={s.divider}><span>or</span></div>

                    <p style={s.footer}>
                        Don't have an account?{' '}
                        <Link to="/register" style={s.link}>Create account</Link>
                    </p>
                </div>
            </div>
        </div>
    )
}

const s = {
    page:      { minHeight:'100vh', display:'flex' },
    left:      { flex:1, background:'linear-gradient(145deg,#0F172A 0%,#1E3A5F 50%,#0F172A 100%)', display:'flex', alignItems:'center', padding:'60px', position:'relative', overflow:'hidden' },
    leftInner: { position:'relative', zIndex:1, maxWidth:'440px' },
    badge:     { display:'inline-flex', alignItems:'center', gap:'8px', background:'#FFFFFF15', border:'1px solid #FFFFFF20', borderRadius:'20px', padding:'6px 16px', fontSize:'13px', color:'#94A3B8', marginBottom:'32px' },
    hero:      { fontSize:'48px', fontWeight:'700', color:'#F8FAFC', lineHeight:'1.15', marginBottom:'20px', letterSpacing:'-1px' },
    heroSub:   { fontSize:'15px', color:'#94A3B8', lineHeight:'1.7', marginBottom:'40px' },
    stats:     { display:'flex', gap:'32px' },
    stat:      { borderLeft:'2px solid #2563EB', paddingLeft:'16px' },
    statVal:   { fontSize:'18px', fontWeight:'700', color:'#F8FAFC' },
    statLabel: { fontSize:'12px', color:'#64748B', marginTop:'2px' },
    right:     { width:'480px', background:'#FFFFFF', display:'flex', alignItems:'center', justifyContent:'center', padding:'40px' },
    form:      { width:'100%', maxWidth:'360px' },
    logo:      { display:'flex', alignItems:'center', gap:'10px', marginBottom:'40px' },
    logoMark:  { width:'36px', height:'36px', background:'linear-gradient(135deg,#2563EB,#1D4ED8)', borderRadius:'10px', display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontWeight:'700', fontSize:'18px' },
    logoText:  { fontSize:'20px', fontWeight:'700', color:'#0D1117' },
    title:     { fontSize:'26px', fontWeight:'700', color:'#0D1117', marginBottom:'6px' },
    sub:       { fontSize:'14px', color:'#6B7280', marginBottom:'28px' },
    error:     { background:'#FEF2F2', border:'1px solid #FECACA', color:'#DC2626', padding:'12px 14px', borderRadius:'10px', fontSize:'13px', marginBottom:'20px', display:'flex', gap:'8px', alignItems:'center' },
    field:     { marginBottom:'18px' },
    label:     { display:'block', fontSize:'13px', fontWeight:'500', color:'#374151', marginBottom:'6px' },
    input:     { width:'100%', border:'1.5px solid #E5E7EB', borderRadius:'10px', padding:'12px 14px', fontSize:'14px', color:'#0D1117', background:'#F9FAFB', boxSizing:'border-box', transition:'all .2s' },
    btn:       { width:'100%', background:'linear-gradient(135deg,#2563EB,#1D4ED8)', color:'#fff', border:'none', borderRadius:'10px', padding:'13px', fontSize:'15px', fontWeight:'600', cursor:'pointer', marginTop:'4px', transition:'opacity .2s' },
    btnOff:    { width:'100%', background:'#E5E7EB', color:'#9CA3AF', border:'none', borderRadius:'10px', padding:'13px', fontSize:'15px', fontWeight:'600', cursor:'not-allowed', marginTop:'4px' },
    divider:   { textAlign:'center', color:'#D1D5DB', fontSize:'13px', margin:'20px 0', position:'relative' },
    footer:    { textAlign:'center', fontSize:'13px', color:'#6B7280' },
    link:      { color:'#2563EB', fontWeight:'600', textDecoration:'none' },
}

export default Login