import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import API from '../api/axios'

function Dashboard() {
    const { user, logout, updateBalance } = useAuth()
    const navigate = useNavigate()
    const [transactions, setTransactions] = useState([])
    const [modal, setModal]   = useState(null)
    const [amount, setAmount] = useState('')
    const [target, setTarget] = useState('')
    const [desc, setDesc]     = useState('')
    const [msg, setMsg]       = useState('')
    const [error, setError]   = useState('')
    const [loading, setLoading] = useState(false)
    const [balanceVisible, setBalanceVisible] = useState(true)

    useEffect(() => { fetchTransactions() }, [])

    const fetchTransactions = async () => {
        try {
            const res = await API.get('/api/bank/transactions')
            setTransactions(Array.isArray(res.data) ? res.data : [])
        } catch {}
    }

    const handleLogout = () => { logout(); navigate('/login') }

    const openModal = (type) => {
        setModal(type)
        setAmount(''); setTarget(''); setDesc(''); setMsg(''); setError('')
    }

    const handleAction = async () => {
        if (!amount || isNaN(amount) || Number(amount) <= 0) {
            setError('Please enter a valid amount.'); return
        }
        setLoading(true); setError(''); setMsg('')
        try {
            let res
            if (modal === 'deposit')
                res = await API.post('/api/bank/deposit', { amount: Number(amount), description: desc })
            else if (modal === 'withdraw')
                res = await API.post('/api/bank/withdraw', { amount: Number(amount), description: desc })
            else if (modal === 'transfer') {
                if (!target) { setError('Enter target account number!'); setLoading(false); return }
                res = await API.post('/api/bank/transfer', { amount: Number(amount), targetAccountNumber: target, description: desc })
            }
            updateBalance(res.data.balanceAfter)
            setMsg(`Transaction successful! New balance: ₹${res.data.balanceAfter?.toLocaleString('en-IN')}`)
            fetchTransactions()
            setTimeout(() => setModal(null), 2500)
        } catch (err) {
            setError(err.response?.data?.message || 'Transaction failed. Please try again.')
        } finally { setLoading(false) }
    }

    const txColor  = t => (t==='DEPOSIT'||t==='TRANSFER_RECEIVED') ? '#16A34A' : '#DC2626'
    const txSign   = t => (t==='DEPOSIT'||t==='TRANSFER_RECEIVED') ? '+' : '-'
    const txBg     = t => (t==='DEPOSIT'||t==='TRANSFER_RECEIVED') ? '#F0FDF4' : '#FEF2F2'
    const txIcon   = t => ({DEPOSIT:'↓',WITHDRAWAL:'↑',TRANSFER_SENT:'→',TRANSFER_RECEIVED:'←'}[t]||'•')

    const modalTitle = { deposit:'Deposit Funds', withdraw:'Withdraw Funds', transfer:'Transfer Money' }
    const modalColor = { deposit:'#16A34A', withdraw:'#DC2626', transfer:'#2563EB' }

    return (
        <div style={s.page}>

            {/* TOPBAR */}
            <div style={s.topbar}>
                <div style={s.brand}>
                    <div style={s.logoMark}>A</div>
                    <span style={s.brandText}>AshwBank</span>
                </div>
                <div style={s.topRight}>
                    <div style={s.userPill}>
                        <div style={s.avatar}>{user?.name?.charAt(0).toUpperCase()}</div>
                        <div>
                            <div style={{fontSize:'13px', fontWeight:'600', color:'#0D1117'}}>{user?.name}</div>
                            <div style={{fontSize:'11px', color:'#9CA3AF', fontFamily:'DM Mono, monospace'}}>{user?.accountNumber}</div>
                        </div>
                    </div>
                    <button style={s.logoutBtn} onClick={handleLogout}>Sign out</button>
                </div>
            </div>

            <div style={s.body}>

                {/* BALANCE CARD */}
                <div style={s.balanceCard}>
                    <div style={s.balanceLeft}>
                        <div style={s.balanceLabel}>
                            Available Balance
                            <span style={s.eyeBtn} onClick={()=>setBalanceVisible(!balanceVisible)}>
                                {balanceVisible ? '👁' : '🔒'}
                            </span>
                        </div>
                        <div style={s.balanceAmt}>
                            {balanceVisible
                                ? `₹${user?.balance?.toLocaleString('en-IN',{minimumFractionDigits:2})}`
                                : '₹ ••••••'}
                        </div>
                        <div style={s.accountTag}>
                            {user?.accountType} ACCOUNT
                        </div>
                    </div>
                    <div style={s.balanceRight}>
                        <div style={s.cardChip}>💳</div>
                        <div style={s.cardNumber}>
                            {user?.accountNumber?.slice(0,4)} •• {user?.accountNumber?.slice(-4)}
                        </div>
                    </div>
                </div>

                {/* QUICK ACTIONS */}
                <div style={s.actionsGrid}>
                    {[
                        {label:'Deposit',  icon:'↓', desc:'Add money',     color:'#16A34A', bg:'#F0FDF4', border:'#BBF7D0', action:'deposit'},
                        {label:'Withdraw', icon:'↑', desc:'Take out money', color:'#DC2626', bg:'#FEF2F2', border:'#FECACA', action:'withdraw'},
                        {label:'Transfer', icon:'→', desc:'Send money',     color:'#2563EB', bg:'#EFF6FF', border:'#BFDBFE', action:'transfer'},
                        {label:'History',  icon:'☰', desc:'View all',       color:'#7C3AED', bg:'#F5F3FF', border:'#DDD6FE', action:'history'},
                    ].map(btn=>(
                        <button key={btn.action} style={{...s.actionCard, background: btn.bg, border:`1.5px solid ${btn.border}`}}
                            onClick={()=> btn.action==='history' ? document.getElementById('history')?.scrollIntoView({behavior:'smooth'}) : openModal(btn.action)}>
                            <div style={{...s.actionIcon, color: btn.color, background:'#FFFFFF', border:`1px solid ${btn.border}`}}>
                                {btn.icon}
                            </div>
                            <div style={{fontSize:'14px', fontWeight:'600', color:'#0D1117'}}>{btn.label}</div>
                            <div style={{fontSize:'11px', color:'#9CA3AF'}}>{btn.desc}</div>
                        </button>
                    ))}
                </div>

                {/* TRANSACTIONS */}
                <div id="history" style={s.txCard}>
                    <div style={s.txTop}>
                        <div>
                            <div style={{fontSize:'16px', fontWeight:'700', color:'#0D1117'}}>Transaction History</div>
                            <div style={{fontSize:'12px', color:'#9CA3AF', marginTop:'2px'}}>{transactions.length} total transactions</div>
                        </div>
                    </div>

                    {transactions.length === 0 ? (
                        <div style={s.empty}>
                            <div style={{fontSize:'48px', marginBottom:'12px'}}>🏦</div>
                            <div style={{fontSize:'15px', fontWeight:'600', color:'#374151', marginBottom:'4px'}}>No transactions yet</div>
                            <div style={{fontSize:'13px', color:'#9CA3AF'}}>Make your first deposit to get started</div>
                        </div>
                    ) : transactions.map((tx,i)=>(
                        <div key={i} style={s.txRow}>
                            <div style={{...s.txBadge, background: txBg(tx.type), color: txColor(tx.type)}}>
                                {txIcon(tx.type)}
                            </div>
                            <div style={{flex:1}}>
                                <div style={{fontSize:'14px', fontWeight:'500', color:'#0D1117'}}>
                                    {tx.description || tx.type?.replace('_',' ')}
                                </div>
                                <div style={{fontSize:'12px', color:'#9CA3AF', marginTop:'2px', fontFamily:'DM Mono, monospace'}}>
                                    {new Date(tx.createdAt).toLocaleString('en-IN',{day:'2-digit',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit'})}
                                </div>
                            </div>
                            <div style={{textAlign:'right'}}>
                                <div style={{fontSize:'15px', fontWeight:'700', color: txColor(tx.type)}}>
                                    {txSign(tx.type)}₹{tx.amount?.toLocaleString('en-IN')}
                                </div>
                                <div style={{fontSize:'11px', color:'#9CA3AF', marginTop:'2px'}}>
                                    Bal ₹{tx.balanceAfter?.toLocaleString('en-IN')}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* MODAL */}
            {modal && (
                <div style={s.overlay} onClick={()=>setModal(null)}>
                    <div style={s.modal} onClick={e=>e.stopPropagation()}>
                        <div style={s.modalTop}>
                            <div>
                                <div style={{fontSize:'18px', fontWeight:'700', color:'#0D1117'}}>{modalTitle[modal]}</div>
                                <div style={{fontSize:'13px', color:'#9CA3AF', marginTop:'2px'}}>
                                    Current balance: ₹{user?.balance?.toLocaleString('en-IN')}
                                </div>
                            </div>
                            <button style={s.closeBtn} onClick={()=>setModal(null)}>✕</button>
                        </div>

                        {msg   && <div style={s.success}>✅ {msg}</div>}
                        {error && <div style={s.errorBox}>⚠️ {error}</div>}

                        <div style={s.field}>
                            <label style={s.label}>Amount (₹)</label>
                            <input style={s.amtInput} type="number" placeholder="0.00"
                                value={amount} onChange={e=>setAmount(e.target.value)}/>
                        </div>

                        {modal==='transfer' && (
                            <div style={s.field}>
                                <label style={s.label}>Target Account Number</label>
                                <input style={s.input} placeholder="ASHW12345678"
                                    value={target} onChange={e=>setTarget(e.target.value)}/>
                            </div>
                        )}

                        <div style={s.field}>
                            <label style={s.label}>Description <span style={{color:'#9CA3AF'}}>(optional)</span></label>
                            <input style={s.input} placeholder="e.g. Rent, Salary, Transfer..."
                                value={desc} onChange={e=>setDesc(e.target.value)}/>
                        </div>

                        <button
                            style={{...s.modalBtn, background: loading ? '#E5E7EB' : `linear-gradient(135deg,${modalColor[modal]},${modalColor[modal]}CC)`, color: loading ? '#9CA3AF' : '#fff', cursor: loading ? 'not-allowed' : 'pointer'}}
                            onClick={handleAction} disabled={loading}>
                            {loading ? 'Processing...' : `Confirm ${modal.charAt(0).toUpperCase()+modal.slice(1)}`}
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}

const s = {
    page:       { minHeight:'100vh', background:'#F0F2F5' },
    topbar:     { background:'#FFFFFF', borderBottom:'1px solid #E5E7EB', padding:'14px 32px', display:'flex', alignItems:'center', justifyContent:'space-between', position:'sticky', top:0, zIndex:100 },
    brand:      { display:'flex', alignItems:'center', gap:'10px' },
    logoMark:   { width:'32px', height:'32px', background:'linear-gradient(135deg,#2563EB,#1D4ED8)', borderRadius:'9px', display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontWeight:'700', fontSize:'16px' },
    brandText:  { fontSize:'18px', fontWeight:'700', color:'#0D1117' },
    topRight:   { display:'flex', alignItems:'center', gap:'16px' },
    userPill:   { display:'flex', alignItems:'center', gap:'10px', background:'#F9FAFB', border:'1px solid #E5E7EB', borderRadius:'12px', padding:'8px 14px' },
    avatar:     { width:'30px', height:'30px', borderRadius:'8px', background:'linear-gradient(135deg,#2563EB,#1D4ED8)', display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontWeight:'700', fontSize:'13px' },
    logoutBtn:  { background:'none', border:'1px solid #E5E7EB', borderRadius:'8px', padding:'7px 16px', color:'#6B7280', fontSize:'13px', cursor:'pointer', fontFamily:'DM Sans, sans-serif' },
    body:       { maxWidth:'760px', margin:'0 auto', padding:'28px 16px' },
    balanceCard:{ background:'linear-gradient(135deg,#1E3A5F,#0F172A)', borderRadius:'20px', padding:'28px 32px', marginBottom:'20px', display:'flex', justifyContent:'space-between', alignItems:'center' },
    balanceLeft:{ flex:1 },
    balanceLabel:{ fontSize:'12px', color:'#94A3B8', letterSpacing:'.08em', marginBottom:'10px', display:'flex', alignItems:'center', gap:'10px' },
    eyeBtn:     { cursor:'pointer', fontSize:'14px' },
    balanceAmt: { fontSize:'38px', fontWeight:'700', color:'#F8FAFC', fontFamily:'DM Mono, monospace', letterSpacing:'-1px', marginBottom:'10px' },
    accountTag: { display:'inline-block', background:'#FFFFFF15', border:'1px solid #FFFFFF20', borderRadius:'6px', padding:'3px 10px', fontSize:'11px', color:'#94A3B8', letterSpacing:'.1em' },
    balanceRight:{ textAlign:'right' },
    cardChip:   { fontSize:'28px', marginBottom:'8px' },
    cardNumber: { fontSize:'13px', color:'#64748B', fontFamily:'DM Mono, monospace' },
    actionsGrid:{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'14px', marginBottom:'20px' },
    actionCard: { borderRadius:'16px', padding:'18px 14px', display:'flex', flexDirection:'column', alignItems:'center', gap:'8px', cursor:'pointer', border:'none', transition:'transform .15s', textAlign:'center' },
    actionIcon: { width:'42px', height:'42px', borderRadius:'12px', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'18px', fontWeight:'700', marginBottom:'2px' },
    txCard:     { background:'#FFFFFF', borderRadius:'20px', border:'1px solid #E5E7EB', overflow:'hidden' },
    txTop:      { padding:'20px 24px', borderBottom:'1px solid #F3F4F6', display:'flex', justifyContent:'space-between', alignItems:'center' },
    txRow:      { display:'flex', alignItems:'center', gap:'14px', padding:'16px 24px', borderBottom:'1px solid #F9FAFB', transition:'background .15s' },
    txBadge:    { width:'40px', height:'40px', borderRadius:'12px', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'16px', fontWeight:'700', flexShrink:0 },
    empty:      { padding:'60px', textAlign:'center' },
    overlay:    { position:'fixed', inset:0, background:'#00000066', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000, padding:'20px' },
    modal:      { background:'#FFFFFF', borderRadius:'20px', padding:'28px', width:'100%', maxWidth:'420px', boxShadow:'0 20px 60px #00000030' },
    modalTop:   { display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'24px' },
    closeBtn:   { background:'#F3F4F6', border:'none', borderRadius:'8px', width:'32px', height:'32px', cursor:'pointer', fontSize:'13px', color:'#6B7280', display:'flex', alignItems:'center', justifyContent:'center' },
    success:    { background:'#F0FDF4', border:'1px solid #BBF7D0', color:'#16A34A', padding:'12px 14px', borderRadius:'10px', fontSize:'13px', marginBottom:'16px' },
    errorBox:   { background:'#FEF2F2', border:'1px solid #FECACA', color:'#DC2626', padding:'12px 14px', borderRadius:'10px', fontSize:'13px', marginBottom:'16px' },
    field:      { marginBottom:'16px' },
    label:      { display:'block', fontSize:'13px', fontWeight:'500', color:'#374151', marginBottom:'6px' },
    amtInput:   { width:'100%', border:'2px solid #E5E7EB', borderRadius:'10px', padding:'14px', fontSize:'24px', fontWeight:'700', color:'#0D1117', background:'#F9FAFB', boxSizing:'border-box', fontFamily:'DM Mono, monospace' },
    input:      { width:'100%', border:'1.5px solid #E5E7EB', borderRadius:'10px', padding:'12px 14px', fontSize:'14px', color:'#0D1117', background:'#F9FAFB', boxSizing:'border-box' },
    modalBtn:   { width:'100%', border:'none', borderRadius:'10px', padding:'14px', fontSize:'15px', fontWeight:'600', fontFamily:'DM Sans, sans-serif' },
}

export default Dashboard