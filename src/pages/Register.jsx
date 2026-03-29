import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import API from '../api/axios'

function Register() {
    const [form, setForm]       = useState({ name:'', email:'', password:'', accountType:'SAVINGS' })
    const [error, setError]     = useState('')
    const [loading, setLoading] = useState(false)
    const { login } = useAuth()
    const navigate  = useNavigate()

    const change = e => setForm({...form, [e.target.name]: e.target.value})

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true); setError('')
        try {
            const res = await API.post('/api/auth/register', form)
            login({
                name: res.data.name, email: res.data.email,
                accountNumber: res.data.accountNumber,
                balance: res.data.balance, accountType: res.data.accountType,
            }, res.data.token)
            navigate('/dashboard')
        } catch {
            setError('Registration failed. Email may already exist.')
        } finally { setLoading(false) }
    }

    return (
        <div style={s.page}>
            <div style={s.left}>
                <div style={s.leftInner}>
                    <div style={s.badge}>🏦 Open Account in 30 seconds</div>
                    <h1 style={s.hero}>Start your<br/>banking journey.</h1>
                    <p style={s.heroSub}>Create your AshwBank account instantly. No paperwork, no waiting. Get your unique account number and start transacting right away.</p>
                    <div style={s.features}>
                        {['✓  Instant account creation','✓  Unique ASHW account number','✓  Deposit, withdraw & transfer','✓  Full transaction history'].map(f=>(
                            <div key={f} style={s.feature}>{f}</div>
                        ))}
                    </div>
                </div>
            </div>

            <div style={s.right}>
                <div style={s.form}>
                    <div style={s.logo}>
                        <div style={s.logoMark}>A</div>
                        <span style={s.logoText}>AshwBank</span>
                    </div>

                    <h2 style={s.title}>Create account</h2>
                    <p style={s.sub}>Fill in your details to get started</p>

                    {error && <div style={s.error}>⚠️ {error}</div>}

                    <form onSubmit={handleSubmit}>
                        {[
                            {label:'Full Name', name:'name', type:'text', placeholder:'Ashwajeet Chavhan'},
                            {label:'Email address', name:'email', type:'email', placeholder:'you@gmail.com'},
                            {label:'Password', name:'password', type:'password', placeholder:'Min 6 characters'},
                        ].map(f=>(
                            <div key={f.name} style={s.field}>
                                <label style={s.label}>{f.label}</label>
                                <input style={s.input} type={f.type} name={f.name}
                                    placeholder={f.placeholder}
                                    value={form[f.name]} onChange={change} required/>
                            </div>
                        ))}

                        <div style={s.field}>
                            <label style={s.label}>Account Type</label>
                            <div style={s.typeRow}>
                                {[
                                    {id:'SAVINGS', icon:'💰', title:'Savings', desc:'For personal use'},
                                    {id:'CURRENT', icon:'🏢', title:'Current', desc:'For business use'},
                                ].map(t=>(
                                    <div key={t.id}
                                        style={{...s.typeCard, ...(form.accountType===t.id ? s.typeActive : {})}}
                                        onClick={()=>setForm({...form, accountType:t.id})}>
                                        <div style={{fontSize:'20px'}}>{t.icon}</div>
                                        <div style={{fontSize:'13px', fontWeight:'600', color: form.accountType===t.id ? '#2563EB' : '#0D1117'}}>{t.title}</div>
                                        <div style={{fontSize:'11px', color:'#9CA3AF'}}>{t.desc}</div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <button style={loading ? s.btnOff : s.btn} type="submit" disabled={loading}>
                            {loading ? 'Creating account...' : 'Create Account →'}
                        </button>
                    </form>

                    <p style={s.footer}>
                        Already have an account?{' '}
                        <Link to="/login" style={s.link}>Sign in</Link>
                    </p>
                </div>
            </div>
        </div>
    )
}

const s = {
    page:      { minHeight:'100vh', display:'flex' },
    left:      { flex:1, background:'linear-gradient(145deg,#0F172A,#1E3A5F,#0F172A)', display:'flex', alignItems:'center', padding:'60px' },
    leftInner: { maxWidth:'440px' },
    badge:     { display:'inline-flex', background:'#FFFFFF15', border:'1px solid #FFFFFF20', borderRadius:'20px', padding:'6px 16px', fontSize:'13px', color:'#94A3B8', marginBottom:'32px' },
    hero:      { fontSize:'44px', fontWeight:'700', color:'#F8FAFC', lineHeight:'1.2', marginBottom:'20px', letterSpacing:'-1px' },
    heroSub:   { fontSize:'15px', color:'#94A3B8', lineHeight:'1.7', marginBottom:'36px' },
    features:  { display:'flex', flexDirection:'column', gap:'12px' },
    feature:   { fontSize:'14px', color:'#CBD5E1', letterSpacing:'0.01em' },
    right:     { width:'500px', background:'#FFFFFF', display:'flex', alignItems:'center', justifyContent:'center', padding:'40px', overflowY:'auto' },
    form:      { width:'100%', maxWidth:'380px' },
    logo:      { display:'flex', alignItems:'center', gap:'10px', marginBottom:'36px' },
    logoMark:  { width:'36px', height:'36px', background:'linear-gradient(135deg,#2563EB,#1D4ED8)', borderRadius:'10px', display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontWeight:'700', fontSize:'18px' },
    logoText:  { fontSize:'20px', fontWeight:'700', color:'#0D1117' },
    title:     { fontSize:'26px', fontWeight:'700', color:'#0D1117', marginBottom:'6px' },
    sub:       { fontSize:'14px', color:'#6B7280', marginBottom:'24px' },
    error:     { background:'#FEF2F2', border:'1px solid #FECACA', color:'#DC2626', padding:'12px 14px', borderRadius:'10px', fontSize:'13px', marginBottom:'16px' },
    field:     { marginBottom:'16px' },
    label:     { display:'block', fontSize:'13px', fontWeight:'500', color:'#374151', marginBottom:'6px' },
    input:     { width:'100%', border:'1.5px solid #E5E7EB', borderRadius:'10px', padding:'12px 14px', fontSize:'14px', color:'#0D1117', background:'#F9FAFB', boxSizing:'border-box', transition:'all .2s' },
    typeRow:   { display:'flex', gap:'10px' },
    typeCard:  { flex:1, border:'1.5px solid #E5E7EB', borderRadius:'12px', padding:'14px', display:'flex', flexDirection:'column', gap:'4px', cursor:'pointer', transition:'all .2s', background:'#F9FAFB' },
    typeActive:{ border:'1.5px solid #2563EB', background:'#EFF6FF' },
    btn:       { width:'100%', background:'linear-gradient(135deg,#2563EB,#1D4ED8)', color:'#fff', border:'none', borderRadius:'10px', padding:'13px', fontSize:'15px', fontWeight:'600', cursor:'pointer', marginTop:'4px' },
    btnOff:    { width:'100%', background:'#E5E7EB', color:'#9CA3AF', border:'none', borderRadius:'10px', padding:'13px', fontSize:'15px', fontWeight:'600', cursor:'not-allowed', marginTop:'4px' },
    footer:    { textAlign:'center', fontSize:'13px', color:'#6B7280', marginTop:'24px' },
    link:      { color:'#2563EB', fontWeight:'600', textDecoration:'none' },
}

export default Register