import { useState, useEffect, useCallback } from 'react'
import './Cashier.css'

const API = import.meta.env.VITE_API_URL || 'http://localhost:3001/api'

// Payment method modal
function PaymentModal({ total, onConfirm, onCancel }) {
  return (
    <div className="cashier-modal-overlay">
      <div className="cashier-modal">
        <h2 className="cashier-modal__title">Select Payment Method</h2>
        <p className="cashier-modal__total">Total: <strong>${total.toFixed(2)}</strong></p>
        <div className="cashier-modal__buttons">
          <button className="cashier-modal__pay-btn cashier-modal__pay-btn--cash" onClick={() => onConfirm('Cash')}>💵 Cash</button>
          <button className="cashier-modal__pay-btn cashier-modal__pay-btn--credit" onClick={() => onConfirm('Credit')}>💳 Credit</button>
          <button className="cashier-modal__pay-btn cashier-modal__pay-btn--debit" onClick={() => onConfirm('Debit')}>🏦 Debit</button>
        </div>
        <button className="cashier-modal__cancel" onClick={onCancel}>Cancel</button>
      </div>
    </div>
  )
}


const SUGAR_LEVELS = ['0%', '25%', '50%', '75%', '100%', '125%', '150%']
const ICE_LEVELS = ['No Ice', 'Less Ice', 'Regular Ice', 'Extra Ice']
const TOPPINGS = [
  { label: 'None', price: 0 },
  { label: 'Boba (+$0.50)', price: 0.50 },
  { label: 'Lychee Jelly (+$0.50)', price: 0.50 },
  { label: 'Pudding (+$0.50)', price: 0.50 },
]
const SIZES = [
  { name: 'Small', priceAdj: 0 },
  { name: 'Large', priceAdj: 0.75 },
]
const BLENDED_CATEGORIES = ['Slush', 'Blended', 'Smoothie']

export default function CashierApp() {
  const [employee, setEmployee] = useState(null)
  const [loginId, setLoginId] = useState('')
  const [loginError, setLoginError] = useState('')

  const [menu, setMenu] = useState([])
  const [categories, setCategories] = useState([])

  // center panel state
  const [centerView, setCenterView] = useState('categories') // categories | items | customize
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [selectedItem, setSelectedItem] = useState(null)
  const [sugar, setSugar] = useState('100%')
  const [ice, setIce] = useState('Regular Ice')
  const [temp, setTemp] = useState('Cold')
  const [toppings, setToppings] = useState([])
  const [size, setSize] = useState('Small')
  const [editingItemId, setEditingItemId] = useState(null)

  // cart / order state
  const [cart, setCart] = useState([])
  const [orderLog, setOrderLog] = useState('')
  const [cartTotal, setCartTotal] = useState(0)
  const [showPaymentModal, setShowPaymentModal] = useState(false)

  // fetch menu once logged in
  useEffect(() => {
    if (!employee) return
    fetch(`${API}/menu`)
      .then(r => r.json())
      .then(data => {
        setMenu(data)
        const cats = [...new Set(data.filter(i => i.category !== 'Add-on').map(i => i.category))]
        if (!cats.includes('Seasonal')) cats.push('Seasonal')
        if (!cats.includes('Blended')) cats.push('Blended')
        setCategories(cats)
      })
  }, [employee])

  // --- AUTH ---
  const handleLogin = async (e) => {
    e.preventDefault()
    setLoginError('')
    const res = await fetch(`${API}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ employeeId: loginId }),
    })
    const data = await res.json()
    if (!res.ok) { setLoginError(data.error || 'Login failed'); return }
    if (data.role.toLowerCase() === 'manager') {
      setLoginError('Managers must use the Manager view.')
      return
    }
    setEmployee(data)
  }

  const handleLogout = () => {
    setEmployee(null)
    setLoginId('')
    setCart([])
    setOrderLog('')
    setCartTotal(0)
    setCenterView('categories')
    setEditingItemId(null)
  }

  // --- CART ---
  const itemTotal = useCallback(() => {
    if (!selectedItem) return 0
    let addOnsPrice = 0
    if (toppings && toppings.length > 0) {
      toppings.forEach(t => {
        const top = TOPPINGS.find(obj => obj.label === t)
        if (top) addOnsPrice += top.price
      })
    }
    const sizeAdj = SIZES.find(s => s.name === size)?.priceAdj || 0
    return selectedItem.price + addOnsPrice + sizeAdj
  }, [selectedItem, toppings, size])

  const addToCart = () => {
    let addOnsPrice = 0
    if (toppings && toppings.length > 0) {
      toppings.forEach(t => {
        const top = TOPPINGS.find(obj => obj.label === t)
        if (top) addOnsPrice += top.price
      })
    }
    const sizeAdj = SIZES.find(s => s.name === size)?.priceAdj || 0
    const finalPrice = selectedItem.price + addOnsPrice + sizeAdj

    if (editingItemId) {
      // Edit mode: replace the old item and adjust totals
      const oldItem = cart.find(i => i.id === editingItemId)
      const diff = finalPrice - oldItem.finalPrice

      setCart(prev => prev.map(i => i.id === editingItemId ? {
        ...i,
        finalPrice,
        sugar,
        ice,
        temp,
        toppings,
        size,
      } : i))
      setCartTotal(prev => prev + diff)
    } else {
      // Add new item
      const newItem = {
        id: Date.now(),
        menuItemId: selectedItem.menu_item_id,
        name: selectedItem.item_name,
        basePrice: selectedItem.price,
        unitPrice: finalPrice,
        finalPrice,
        quantity: 1,
        sugar,
        ice,
        temp,
        toppings,
        size,
      }
      setCart(prev => [...prev, newItem])
      setCartTotal(prev => prev + finalPrice)
    }

    setCenterView('categories')
    setEditingItemId(null)
    setSugar('100%'); setIce('Regular Ice'); setTemp('Cold'); setToppings([]); setSize('Small')
  }

  const updateQuantity = (itemId, delta) => {
    setCart(prev => {
      const updated = prev.map(c => {
        if (c.id !== itemId) return c
        const newQty = (c.quantity || 1) + delta
        if (newQty < 1) return null // will be filtered
        const unitPrice = c.unitPrice || (c.finalPrice / (c.quantity || 1))
        return { ...c, quantity: newQty, unitPrice, finalPrice: unitPrice * newQty }
      }).filter(Boolean)
      return updated
    })
  }

  // Re-build order log string and cart total anytime cart changes
  useEffect(() => {
    let newLog = ''
    let total = 0
    cart.forEach(c => {
      const qty = c.quantity || 1
      const unitPrice = c.unitPrice || c.finalPrice
      total += unitPrice * qty
      newLog += `${qty > 1 ? `${qty}x ` : ''}${c.name} - $${(unitPrice * qty).toFixed(2)}\n  - ${c.size || 'Small'}\n  - ${c.temp === 'Hot' ? '🔥 Hot' : 'Cold'}\n  - ${c.sugar} Sugar\n  - ${c.ice}\n  - ${c.toppings && c.toppings.length > 0 ? c.toppings.join(', ') : 'None'}\n\n`
    })
    setOrderLog(newLog)
    setCartTotal(total)
  }, [cart])

  const clearCart = () => {
    setCart([]); setCartTotal(0); setOrderLog(''); setCenterView('categories'); setEditingItemId(null); setTemp('Cold'); setSize('Small');
  }

  const editCartItem = (itemId) => {
    const itemToEdit = cart.find(i => i.id === itemId)
    if (!itemToEdit) return
    const fullMenuObj = menu.find(m => m.menu_item_id === itemToEdit.menuItemId)
    setSelectedItem(fullMenuObj)
    setSugar(itemToEdit.sugar)
    setIce(itemToEdit.ice)
    setTemp(itemToEdit.temp || 'Cold')
    setToppings(itemToEdit.toppings || [])
    setSize(itemToEdit.size || 'Small')
    setEditingItemId(itemId)
    setCenterView('customize')
  }

  const handleCheckout = () => {
    if (cart.length === 0) { alert('Cart is empty! Add items first.'); return }
    setShowPaymentModal(true)
  }

  const submitOrder = async (paymentMethod) => {
    setShowPaymentModal(false)
    // Expand quantity > 1 items into multiple order_items entries
    const expandedItems = []
    cart.forEach(i => {
      const qty = i.quantity || 1
      const unitPrice = i.unitPrice || i.finalPrice
      for (let q = 0; q < qty; q++) {
        expandedItems.push({
          menuItemId: i.menuItemId,
          finalPrice: unitPrice,
          basePrice: i.basePrice,
          sugarLevel: i.sugar,
          iceLevel: i.ice,
          toppings: i.toppings,
        })
      }
    })

    const res = await fetch(`${API}/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        items: expandedItems,
        paymentMethod,
        employeeId: employee.employeeId,
      }),
    })
    const data = await res.json()
    if (data.success) { alert('Order placed successfully!'); clearCart() }
    else alert('Error placing order. Check database connection.')
  }

  const categoryItems = menu.filter(i => i.category === selectedCategory)

  // ========== LOGIN SCREEN ==========
  if (!employee) {
    return (
      <div className="cashier-login">
        <h1 className="cashier-login__title">DRAGON BOBA</h1>
        <form className="cashier-login__form" onSubmit={handleLogin}>
          <label>Employee ID:</label>
          <input
            type="text"
            value={loginId}
            onChange={e => setLoginId(e.target.value)}
            autoFocus
          />
          {loginError && <p className="cashier-login__error">{loginError}</p>}
          <button type="submit">Login</button>
        </form>
      </div>
    )
  }

  // ========== CASHIER MAIN SCREEN ==========
  return (
    <>
    <div className="cashier">
      {/* CENTER PANEL */}
      <div className="cashier__center">

        {/* CATEGORIES */}
        {centerView === 'categories' && (
          <div className="cashier__category-grid">
            {categories.map(cat => (
              <button
                key={cat}
                className="cashier__cat-btn"
                onClick={() => { setSelectedCategory(cat); setCenterView('items') }}
              >
                {cat}
              </button>
            ))}
          </div>
        )}

        {/* ITEMS */}
        {centerView === 'items' && (
          <div className="cashier__items-container">
            <div className="cashier__items-grid">
              <button
                className="cashier__item-btn cashier__item-btn--back"
                onClick={() => setCenterView('categories')}
              >
                &lt;- Back
              </button>
              {categoryItems.map(item => (
                <button
                  key={item.menu_item_id}
                  className="cashier__item-btn"
                  onClick={() => {
                    setSelectedItem(item)
                    const isHot = item.category === 'Hot Drinks'
                    const isBlended = BLENDED_CATEGORIES.includes(item.category)
                    setSugar('100%')
                    setIce(isHot || isBlended ? 'No Ice' : 'Regular Ice')
                    setTemp(isHot ? 'Hot' : 'Cold')
                    setToppings([])
                    setSize('Small')
                    setCenterView('customize')
                    setEditingItemId(null)
                  }}
                >
                  <span className="cashier__item-name">{item.item_name}</span>
                  <span className="cashier__item-price">${item.price.toFixed(2)}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* CUSTOMIZE */}
        {centerView === 'customize' && selectedItem && (
          <div className="cashier__customize">
            <h2 className="cashier__customize-title">Customize Drink</h2>

            <div className="cashier__customize-row">
              <label>Size:</label>
              <select value={size} onChange={e => setSize(e.target.value)}>
                {SIZES.map(s => (
                  <option key={s.name} value={s.name}>
                    {s.name}{s.priceAdj > 0 ? ` (+$${s.priceAdj.toFixed(2)})` : ''}
                  </option>
                ))}
              </select>
            </div>

            <div className="cashier__customize-row">
              <label>Sugar Level:</label>
              <select value={sugar} onChange={e => setSugar(e.target.value)}>
                {SUGAR_LEVELS.map(l => <option key={l}>{l}</option>)}
              </select>
            </div>

            {!BLENDED_CATEGORIES.includes(selectedItem.category) && (
            <div className="cashier__customize-row">
              <label>Temperature:</label>
              <select value={temp} onChange={e => {
                setTemp(e.target.value)
                if (e.target.value === 'Hot') setIce('No Ice')
              }}>
                <option>Cold</option>
                <option>Hot</option>
              </select>
            </div>
            )}

            {(temp !== 'Hot' || BLENDED_CATEGORIES.includes(selectedItem.category)) && (
            <div className="cashier__customize-row">
              <label>Ice Level:</label>
              <select value={ice} onChange={e => setIce(e.target.value)}>
                {ICE_LEVELS.map(l => <option key={l}>{l}</option>)}
              </select>
            </div>
            )}

            <div className="cashier__customize-row cashier__customize-row--toppings">
              <label>Toppings:</label>
              <div className="cashier__toppings-wrapper">
                {TOPPINGS.filter(t => t.label !== 'None').map(t => (
                  <button
                    key={t.label}
                    className={`cashier__topping-btn ${toppings.includes(t.label) ? 'cashier__topping-btn--active' : ''}`}
                    onClick={() => {
                      setToppings(prev =>
                        prev.includes(t.label) ? prev.filter(x => x !== t.label) : [...prev, t.label]
                      )
                    }}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="cashier__item-total">
              Item Total: ${itemTotal().toFixed(2)}
            </div>

            <div className="cashier__customize-actions">
              <button onClick={() => setCenterView('items')}>Cancel</button>
              <button className="cashier__add-btn" onClick={addToCart}>
                {editingItemId ? 'Update Cart' : 'Add to Cart'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* RIGHT SIDEBAR — ORDER SUMMARY */}
      <div className="cashier__sidebar">
        <div className="cashier__sidebar-title">Current Order</div>
        <div className="cashier__cart-items">
          {cart.map(c => {
            const qty = c.quantity || 1
            const unitPrice = c.unitPrice || c.finalPrice
            return (
              <div key={c.id} className="cashier__cart-item">
                <div className="cashier__cart-item-header">
                  <strong>{c.name}</strong>
                  <span>${(unitPrice * qty).toFixed(2)}</span>
                </div>
                <div className="cashier__cart-item-details">
                  {c.size || 'Small'} &bull; {c.temp === 'Hot' ? '🔥 Hot • ' : ''}{c.sugar} Sugar, {c.ice} <br/>
                  {c.toppings && c.toppings.length > 0 ? c.toppings.join(', ') : 'No Toppings'}
                </div>
                <div className="cashier__cart-item-controls">
                  <div className="cashier__qty-controls">
                    <button className="cashier__qty-btn" onClick={() => updateQuantity(c.id, -1)}>−</button>
                    <span className="cashier__qty-value">{qty}</span>
                    <button className="cashier__qty-btn" onClick={() => updateQuantity(c.id, 1)}>+</button>
                  </div>
                  <button className="cashier__cart-edit-btn" onClick={() => editCartItem(c.id)}>✎ Edit</button>
                </div>
              </div>
            )
          })}
        </div>
        <div className="cashier__sidebar-footer">
          <div className="cashier__total">Total: ${cartTotal.toFixed(2)}</div>
          <div className="cashier__sidebar-btns">
            <button className="cashier__checkout-btn" onClick={handleCheckout}>Check-Out</button>
            <button className="cashier__logout-btn" onClick={handleLogout}>Log Out</button>
          </div>
        </div>
      </div>
    </div>

    {/* PAYMENT MODAL */}
    {showPaymentModal && (
      <PaymentModal
        total={cartTotal}
        onConfirm={submitOrder}
        onCancel={() => setShowPaymentModal(false)}
      />
    )}
    </>
  )
}
