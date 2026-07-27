import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Trash2, Plus, Edit2, Eye } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { useProducts } from '../context/ProductsContext.jsx';

const OWNER_EMAIL = 'owner@selvammaligai.store';
const CATEGORIES = [
  { id: 'c1', name: 'Rice & Grains' },
  { id: 'c2', name: 'Dals & Pulses' },
  { id: 'c3', name: 'Spices & Masalas' },
  { id: 'c4', name: 'Oils & Ghee' },
  { id: 'c5', name: 'Snacks' },
  { id: 'c6', name: 'Dairy' },
  { id: 'c7', name: 'Vegetables' },
  { id: 'c8', name: 'Beverages' },
];

export default function ProductManager() {
  const { user, isAuthenticated } = useAuth();
  const { products, updateProduct, addProduct, deleteProduct } = useProducts();
  const isOwner = user?.email === OWNER_EMAIL;
  
  const [mode, setMode] = useState('view'); // view, add, edit
  const [selectedId, setSelectedId] = useState(products[0]?.id || '');
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [message, setMessage] = useState({ type: '', text: '' });

  const selectedProduct = products.find((p) => p.id === selectedId) || products[0];

  const [form, setForm] = useState({
    name: '',
    category: 'c1',
    image: '🍚',
    imageFile: null,
    mrp: '',
    sellingPrice: '',
    discount: '',
    unit: '',
    stockStatus: 'in_stock',
  });

  useEffect(() => {
    if (mode === 'edit' && selectedProduct) {
      setForm({
        name: selectedProduct.name,
        category: selectedProduct.category,
        image: selectedProduct.image,
        mrp: selectedProduct.mrp,
        sellingPrice: selectedProduct.sellingPrice,
        discount: selectedProduct.discountPercentage,
        unit: selectedProduct.unit,
        stockStatus: selectedProduct.stockStatus,
      });
    } else if (mode === 'add') {
      setForm({
        name: '',
        category: 'c1',
        image: '🍚',
        imageFile: null,
        mrp: '',
        sellingPrice: '',
        discount: '',
        unit: '',
        stockStatus: 'in_stock',
      });
    }
    setMessage({ type: '', text: '' });
  }, [mode, selectedProduct]);

  const handleAddProduct = async (e) => {
    e.preventDefault();
    if (!form.name || !form.mrp || !form.sellingPrice || !form.unit) {
      setMessage({ type: 'error', text: 'Please fill all required fields.' });
      return;
    }

    try {
      const id = await addProduct({
        name: form.name,
        category: form.category,
        image: form.imageFile || form.image,
        mrp: Number(form.mrp),
        sellingPrice: Number(form.sellingPrice),
        discountPercentage: form.discount ? Number(form.discount) : null,
        unit: form.unit,
        stockStatus: form.stockStatus,
      });
      setMessage({ type: 'success', text: 'Product added successfully!' });
      setSelectedId(id);
      setMode('view');
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Unable to save product.' });
    }
  };

  const handleUpdateProduct = async (e) => {
    e.preventDefault();
    if (!form.name || !form.mrp || !form.sellingPrice || !form.unit) {
      setMessage({ type: 'error', text: 'Please fill all required fields.' });
      return;
    }

    try {
      await updateProduct({
        ...selectedProduct,
        name: form.name,
        category: form.category,
        image: form.imageFile || form.image,
        mrp: Number(form.mrp),
        sellingPrice: Number(form.sellingPrice),
        discountPercentage: form.discount ? Number(form.discount) : null,
        unit: form.unit,
        stockStatus: form.stockStatus,
      });
      setMessage({ type: 'success', text: 'Product updated successfully!' });
      setMode('view');
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Unable to update product.' });
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result;
        setForm(f => ({ ...f, imageFile: base64 }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDeleteProduct = async () => {
    try {
      await deleteProduct(deleteConfirm);
      setMessage({ type: 'success', text: 'Product deleted successfully!' });
      setDeleteConfirm(null);
      setSelectedId(products.find((product) => product.id !== deleteConfirm)?.id || '');
      setMode('view');
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Unable to delete product.' });
    }
  };

  if (!isAuthenticated) {
    return (
      <main className="min-h-[70vh] grid place-items-center px-4 py-16">
        <div className="max-w-md rounded-card bg-white dark:bg-leaf-600/20 border border-leaf-100/60 dark:border-leaf-400/10 shadow-soft p-8 text-center">
          <h1 className="font-display font-bold text-2xl text-leaf-500 dark:text-turmeric-100">Owner access required</h1>
          <p className="mt-4 text-sm text-ink-500 dark:text-rice-200/70">
            Please log in with the shop owner account to manage products.
          </p>
          <Link to="/login" className="inline-flex mt-6 rounded-full bg-leaf-500 hover:bg-leaf-400 text-white font-semibold px-6 py-3 transition-colors">
            Log in
          </Link>
        </div>
      </main>
    );
  }

  if (!isOwner) {
    return (
      <main className="min-h-[70vh] grid place-items-center px-4 py-16">
        <div className="max-w-md rounded-card bg-white dark:bg-leaf-600/20 border border-leaf-100/60 dark:border-leaf-400/10 shadow-soft p-8 text-center">
          <h1 className="font-display font-bold text-2xl text-leaf-500 dark:text-turmeric-100">Access denied</h1>
          <p className="mt-4 text-sm text-ink-500 dark:text-rice-200/70">
            Only the shop owner can manage products.
          </p>
          <p className="mt-3 text-xs text-ink-500 dark:text-rice-200/60">
            Log in as <strong>{OWNER_EMAIL}</strong> to access this page.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-[70vh] px-4 py-10 lg:px-10">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-display font-bold text-3xl text-leaf-500 dark:text-turmeric-100">Product Manager</h1>
          <p className="mt-2 text-sm text-ink-500 dark:text-rice-200/70">Add, edit, or delete products from your store</p>
        </div>

        {/* Tabs */}
        <div className="mb-6 flex gap-2 border-b border-leaf-100 dark:border-leaf-400/10">
          <button
            onClick={() => setMode('view')}
            className={`px-4 py-3 font-medium transition-colors border-b-2 ${
              mode === 'view'
                ? 'border-leaf-500 text-leaf-500 dark:text-turmeric-100'
                : 'border-transparent text-ink-500 dark:text-rice-200/70 hover:text-leaf-500'
            }`}
          >
            <Eye className="inline mr-2" size={18} />
            View Products
          </button>
          <button
            onClick={() => setMode('add')}
            className={`px-4 py-3 font-medium transition-colors border-b-2 ${
              mode === 'add'
                ? 'border-leaf-500 text-leaf-500 dark:text-turmeric-100'
                : 'border-transparent text-ink-500 dark:text-rice-200/70 hover:text-leaf-500'
            }`}
          >
            <Plus className="inline mr-2" size={18} />
            Add Product
          </button>
          <button
            onClick={() => setMode('edit')}
            disabled={!selectedProduct}
            className={`px-4 py-3 font-medium transition-colors border-b-2 disabled:opacity-50 ${
              mode === 'edit'
                ? 'border-leaf-500 text-leaf-500 dark:text-turmeric-100'
                : 'border-transparent text-ink-500 dark:text-rice-200/70 hover:text-leaf-500'
            }`}
          >
            <Edit2 className="inline mr-2" size={18} />
            Edit Selected
          </button>
        </div>

        {/* Messages */}
        {message.text && (
          <div className={`mb-4 p-4 rounded-lg ${
            message.type === 'success'
              ? 'bg-leaf-50 dark:bg-leaf-900/40 border border-leaf-200 text-leaf-800 dark:text-leaf-100'
              : 'bg-kumkum-50 dark:bg-kumkum-900/40 border border-kumkum-200 text-kumkum-800 dark:text-kumkum-100'
          }`}>
            {message.text}
          </div>
        )}

        {/* Content */}
        <div className="grid gap-8 lg:grid-cols-[320px_1fr]">
          {/* Products List */}
          <div className="rounded-card bg-white dark:bg-leaf-600/20 border border-leaf-100/60 dark:border-leaf-400/10 shadow-soft p-6 h-fit">
            <h2 className="font-semibold text-leaf-500 mb-4">Products ({products.length})</h2>
            <div className="space-y-2 max-h-[600px] overflow-y-auto">
              {products.map((product) => (
                <button
                  key={product.id}
                  type="button"
                  onClick={() => {
                    setSelectedId(product.id);
                    setMode('edit');
                  }}
                  className={`w-full text-left rounded-xl px-3 py-2 border transition text-sm flex gap-2 items-start ${
                    selectedId === product.id
                      ? 'border-leaf-500 bg-leaf-50 dark:bg-leaf-700/40'
                      : 'border-leaf-100 bg-white dark:bg-leaf-900/40 hover:bg-leaf-50 dark:hover:bg-leaf-900/60'
                  }`}
                >
                  <div className="w-8 h-8 rounded-lg bg-rice-200 dark:bg-leaf-600/30 flex-shrink-0 grid place-items-center text-sm overflow-hidden">
                    {typeof product.image === 'string' && product.image.startsWith('data:image') ? (
                      <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                    ) : (
                      <span>{product.image}</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{product.name}</div>
                    <div className="text-xs text-ink-500 dark:text-rice-200/70">₹{product.sellingPrice}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Forms */}
          <div className="rounded-card bg-white dark:bg-leaf-600/20 border border-leaf-100/60 dark:border-leaf-400/10 shadow-soft p-6">
            {mode === 'view' && selectedProduct && (
              <div className="space-y-6">
                <div className="w-full h-48 mb-4 rounded-lg bg-rice-200 dark:bg-leaf-900/40 overflow-hidden flex items-center justify-center">
                  {typeof selectedProduct.image === 'string' && selectedProduct.image.startsWith('data:image') ? (
                    <img src={selectedProduct.image} alt={selectedProduct.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-5xl">{selectedProduct.image}</span>
                  )}
                </div>
                <div className="grid gap-4">
                  <div>
                    <label className="text-xs font-semibold text-ink-500 dark:text-rice-200/70">Product Name</label>
                    <p className="text-lg font-semibold text-ink-900 dark:text-rice-100">{selectedProduct.name}</p>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-ink-500 dark:text-rice-200/70">Category</label>
                    <p className="text-ink-900 dark:text-rice-100">{CATEGORIES.find(c => c.id === selectedProduct.category)?.name}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-ink-500 dark:text-rice-200/70">MRP</label>
                      <p className="text-ink-900 dark:text-rice-100">₹{selectedProduct.mrp}</p>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-ink-500 dark:text-rice-200/70">Selling Price</label>
                      <p className="text-leaf-600 dark:text-turmeric-200 font-semibold">₹{selectedProduct.sellingPrice}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-ink-500 dark:text-rice-200/70">Unit</label>
                      <p className="text-ink-900 dark:text-rice-100">{selectedProduct.unit}</p>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-ink-500 dark:text-rice-200/70">Stock Status</label>
                      <p className={`font-semibold ${
                        selectedProduct.stockStatus === 'in_stock' ? 'text-leaf-600' :
                        selectedProduct.stockStatus === 'low_stock' ? 'text-turmeric-600' : 'text-kumkum-600'
                      }`}>
                        {selectedProduct.stockStatus === 'in_stock' ? 'In Stock' : 
                         selectedProduct.stockStatus === 'low_stock' ? 'Low Stock' : 'Out of Stock'}
                      </p>
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-ink-500 dark:text-rice-200/70">Discount</label>
                    <p className="text-ink-900 dark:text-rice-100">{selectedProduct.discountPercentage}%</p>
                  </div>
                </div>
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => setMode('edit')}
                    className="flex-1 rounded-full bg-leaf-500 hover:bg-leaf-400 text-white font-semibold py-3 transition-colors"
                  >
                    Edit Product
                  </button>
                  <button
                    onClick={() => setDeleteConfirm(selectedProduct.id)}
                    className="px-6 rounded-full bg-kumkum-500 hover:bg-kumkum-400 text-white font-semibold py-3 transition-colors"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>
            )}

            {mode === 'add' && (
              <form onSubmit={handleAddProduct} className="space-y-4">
                <h2 className="font-semibold text-lg text-leaf-500 mb-4">Add New Product</h2>

                <div>
                  <label className="block text-sm font-medium text-ink-900 dark:text-rice-100 mb-1">Product name *</label>
                  <input
                    required
                    value={form.name}
                    onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))}
                    className="w-full rounded-lg border border-leaf-100 bg-rice-50 dark:bg-leaf-900/40 px-3 py-2 text-sm outline-none focus:border-leaf-400"
                    placeholder="e.g., Ponni Boiled Rice"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-ink-900 dark:text-rice-100 mb-1">Category</label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm(f => ({ ...f, category: e.target.value }))}
                    className="w-full rounded-lg border border-leaf-100 bg-rice-50 dark:bg-leaf-900/40 px-3 py-2 text-sm outline-none focus:border-leaf-400"
                  >
                    {CATEGORIES.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-ink-900 dark:text-rice-100 mb-1">Product Image</label>
                  <div className="space-y-3">
                    <div className="w-full h-40 rounded-lg bg-rice-200 dark:bg-leaf-900/40 overflow-hidden flex items-center justify-center border-2 border-dashed border-leaf-200 dark:border-leaf-400/30">
                      {form.imageFile ? (
                        <img src={form.imageFile} alt="Preview" className="w-full h-full object-cover" />
                      ) : typeof form.image === 'string' && form.image.startsWith('data:image') ? (
                        <img src={form.image} alt="Current" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-4xl">{form.image}</span>
                      )}
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="w-full rounded-lg border border-leaf-100 bg-rice-50 dark:bg-leaf-900/40 px-3 py-2 text-sm outline-none focus:border-leaf-400"
                    />
                    <p className="text-xs text-ink-500 dark:text-rice-200/70">Or use emoji as fallback:</p>
                    <input
                      value={form.image && !form.image.startsWith('data:image') ? form.image : '🍚'}
                      onChange={(e) => setForm(f => ({ ...f, image: e.target.value }))}
                      maxLength="2"
                      className="w-full rounded-lg border border-leaf-100 bg-rice-50 dark:bg-leaf-900/40 px-3 py-2 text-lg outline-none focus:border-leaf-400"
                      placeholder="🍚"
                    />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-ink-900 dark:text-rice-100 mb-1">MRP *</label>
                    <input
                      required
                      type="number"
                      min="0"
                      step="0.01"
                      value={form.mrp}
                      onChange={(e) => setForm(f => ({ ...f, mrp: e.target.value }))}
                      className="w-full rounded-lg border border-leaf-100 bg-rice-50 dark:bg-leaf-900/40 px-3 py-2 text-sm outline-none focus:border-leaf-400"
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-ink-900 dark:text-rice-100 mb-1">Selling Price *</label>
                    <input
                      required
                      type="number"
                      min="0"
                      step="0.01"
                      value={form.sellingPrice}
                      onChange={(e) => setForm(f => ({ ...f, sellingPrice: e.target.value }))}
                      className="w-full rounded-lg border border-leaf-100 bg-rice-50 dark:bg-leaf-900/40 px-3 py-2 text-sm outline-none focus:border-leaf-400"
                      placeholder="0"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-ink-900 dark:text-rice-100 mb-1">Discount (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={form.discount}
                    onChange={(e) => setForm(f => ({ ...f, discount: e.target.value }))}
                    className="w-full rounded-lg border border-leaf-100 bg-rice-50 dark:bg-leaf-900/40 px-3 py-2 text-sm outline-none focus:border-leaf-400"
                    placeholder="e.g., 10"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-ink-900 dark:text-rice-100 mb-1">Unit *</label>
                  <input
                    required
                    value={form.unit}
                    onChange={(e) => setForm(f => ({ ...f, unit: e.target.value }))}
                    className="w-full rounded-lg border border-leaf-100 bg-rice-50 dark:bg-leaf-900/40 px-3 py-2 text-sm outline-none focus:border-leaf-400"
                    placeholder="e.g., 10 kg, 500 g"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-ink-900 dark:text-rice-100 mb-1">Stock Status</label>
                  <select
                    value={form.stockStatus}
                    onChange={(e) => setForm(f => ({ ...f, stockStatus: e.target.value }))}
                    className="w-full rounded-lg border border-leaf-100 bg-rice-50 dark:bg-leaf-900/40 px-3 py-2 text-sm outline-none focus:border-leaf-400"
                  >
                    <option value="in_stock">In Stock</option>
                    <option value="low_stock">Low Stock</option>
                    <option value="out_of_stock">Out of Stock</option>
                  </select>
                </div>

                <button
                  type="submit"
                  className="w-full rounded-full bg-leaf-500 hover:bg-leaf-400 text-white font-semibold py-3 transition-colors mt-6"
                >
                  Add Product
                </button>
              </form>
            )}

            {mode === 'edit' && selectedProduct && (
              <form onSubmit={handleUpdateProduct} className="space-y-4">
                <h2 className="font-semibold text-lg text-leaf-500 mb-4">Edit Product</h2>

                <div>
                  <label className="block text-sm font-medium text-ink-900 dark:text-rice-100 mb-1">Product name *</label>
                  <input
                    required
                    value={form.name}
                    onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))}
                    className="w-full rounded-lg border border-leaf-100 bg-rice-50 dark:bg-leaf-900/40 px-3 py-2 text-sm outline-none focus:border-leaf-400"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-ink-900 dark:text-rice-100 mb-1">Category</label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm(f => ({ ...f, category: e.target.value }))}
                    className="w-full rounded-lg border border-leaf-100 bg-rice-50 dark:bg-leaf-900/40 px-3 py-2 text-sm outline-none focus:border-leaf-400"
                  >
                    {CATEGORIES.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-ink-900 dark:text-rice-100 mb-1">Product Image</label>
                  <div className="space-y-3">
                    <div className="w-full h-40 rounded-lg bg-rice-200 dark:bg-leaf-900/40 overflow-hidden flex items-center justify-center border-2 border-dashed border-leaf-200 dark:border-leaf-400/30">
                      {form.imageFile ? (
                        <img src={form.imageFile} alt="Preview" className="w-full h-full object-cover" />
                      ) : typeof form.image === 'string' && form.image.startsWith('data:image') ? (
                        <img src={form.image} alt="Current" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-4xl">{form.image}</span>
                      )}
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="w-full rounded-lg border border-leaf-100 bg-rice-50 dark:bg-leaf-900/40 px-3 py-2 text-sm outline-none focus:border-leaf-400"
                    />
                    <p className="text-xs text-ink-500 dark:text-rice-200/70">Or use emoji as fallback:</p>
                    <input
                      value={form.image && !form.image.startsWith('data:image') ? form.image : '🍚'}
                      onChange={(e) => setForm(f => ({ ...f, image: e.target.value }))}
                      maxLength="2"
                      className="w-full rounded-lg border border-leaf-100 bg-rice-50 dark:bg-leaf-900/40 px-3 py-2 text-lg outline-none focus:border-leaf-400"
                    />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-ink-900 dark:text-rice-100 mb-1">MRP *</label>
                    <input
                      required
                      type="number"
                      min="0"
                      step="0.01"
                      value={form.mrp}
                      onChange={(e) => setForm(f => ({ ...f, mrp: e.target.value }))}
                      className="w-full rounded-lg border border-leaf-100 bg-rice-50 dark:bg-leaf-900/40 px-3 py-2 text-sm outline-none focus:border-leaf-400"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-ink-900 dark:text-rice-100 mb-1">Selling Price *</label>
                    <input
                      required
                      type="number"
                      min="0"
                      step="0.01"
                      value={form.sellingPrice}
                      onChange={(e) => setForm(f => ({ ...f, sellingPrice: e.target.value }))}
                      className="w-full rounded-lg border border-leaf-100 bg-rice-50 dark:bg-leaf-900/40 px-3 py-2 text-sm outline-none focus:border-leaf-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-ink-900 dark:text-rice-100 mb-1">Discount (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={form.discount}
                    onChange={(e) => setForm(f => ({ ...f, discount: e.target.value }))}
                    className="w-full rounded-lg border border-leaf-100 bg-rice-50 dark:bg-leaf-900/40 px-3 py-2 text-sm outline-none focus:border-leaf-400"
                    placeholder="e.g., 10"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-ink-900 dark:text-rice-100 mb-1">Unit *</label>
                  <input
                    required
                    value={form.unit}
                    onChange={(e) => setForm(f => ({ ...f, unit: e.target.value }))}
                    className="w-full rounded-lg border border-leaf-100 bg-rice-50 dark:bg-leaf-900/40 px-3 py-2 text-sm outline-none focus:border-leaf-400"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-ink-900 dark:text-rice-100 mb-1">Stock Status</label>
                  <select
                    value={form.stockStatus}
                    onChange={(e) => setForm(f => ({ ...f, stockStatus: e.target.value }))}
                    className="w-full rounded-lg border border-leaf-100 bg-rice-50 dark:bg-leaf-900/40 px-3 py-2 text-sm outline-none focus:border-leaf-400"
                  >
                    <option value="in_stock">In Stock</option>
                    <option value="low_stock">Low Stock</option>
                    <option value="out_of_stock">Out of Stock</option>
                  </select>
                </div>

                <div className="flex gap-3 pt-6">
                  <button
                    type="submit"
                    className="flex-1 rounded-full bg-leaf-500 hover:bg-leaf-400 text-white font-semibold py-3 transition-colors"
                  >
                    Update Product
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleteConfirm(selectedProduct.id)}
                    className="px-6 rounded-full bg-kumkum-500 hover:bg-kumkum-400 text-white font-semibold py-3 transition-colors"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* Delete Confirmation Modal */}
        {deleteConfirm && (
          <div className="fixed inset-0 bg-black/40 z-50 grid place-items-center p-4">
            <div className="rounded-card bg-white dark:bg-leaf-600/20 border border-leaf-100/60 dark:border-leaf-400/10 shadow-soft p-6 max-w-md">
              <h3 className="font-display font-bold text-lg text-kumkum-600 dark:text-kumkum-300">Delete product?</h3>
              <p className="mt-2 text-sm text-ink-600 dark:text-rice-200">
                Are you sure you want to delete <strong>{products.find(p => p.id === deleteConfirm)?.name}</strong>? This action cannot be undone.
              </p>
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="flex-1 rounded-full border border-leaf-200 text-leaf-600 font-semibold py-2 hover:bg-leaf-50 dark:hover:bg-leaf-900/40 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteProduct}
                  className="flex-1 rounded-full bg-kumkum-500 hover:bg-kumkum-400 text-white font-semibold py-2 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
