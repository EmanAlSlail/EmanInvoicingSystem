import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  LayoutDashboard, 
  Building2, 
  Users, 
  Package, 
  FileText, 
  BarChart3, 
  Settings, 
  Plus, 
  Search, 
  Download, 
  Languages, 
  Trash2, 
  Edit3, 
  Eye, 
  FileDown, 
  Printer,
  Menu,
  X,
  Save,
  RefreshCw,
  Upload,
  PieChart as PieChartIcon,
  Calendar,
  Signature as SignatureIcon,
  CheckCircle2,
  AlertCircle,
  Moon,
  Sun,
  Mail,
  ArrowLeft
} from 'lucide-react';
import html2pdf from 'html2pdf.js';
import { motion, AnimatePresence } from 'motion/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { QRCodeSVG } from 'qrcode.react';
import { format, addDays, addMonths, addYears, isAfter, parseISO } from 'date-fns';
import Swal from 'sweetalert2';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie
} from 'recharts';
import { generateZatcaQRData, type Company, type Contact, type Product, type Invoice, type InvoiceItem, type RecurringInvoice } from './types';

// --- Utilities ---
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- Components ---

const SidebarItem = ({ 
  icon: Icon, 
  label, 
  active, 
  onClick 
}: { 
  icon: any, 
  label: string, 
  active: boolean, 
  onClick: () => void 
}) => (
  <button
    onClick={onClick}
    className={cn(
      "flex items-center gap-3 w-full px-4 py-3 rounded-xl transition-all duration-200 group",
      active 
        ? "bg-indigo-600 text-white shadow-lg shadow-indigo-200 dark:shadow-none" 
        : "text-slate-500 dark:text-slate-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 hover:text-indigo-600 dark:hover:text-indigo-400"
    )}
  >
    <Icon className={cn("w-5 h-5", active ? "text-white" : "text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400")} />
    <span className="font-medium">{label}</span>
    {active && <motion.div layoutId="active-pill" className="ml-auto w-1.5 h-1.5 rounded-full bg-white" />}
  </button>
);

const Card = ({ children, className, title, subtitle, action }: { children: React.ReactNode, className?: string, title?: string, subtitle?: string, action?: React.ReactNode, key?: any }) => (
  <div className={cn("bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden", className)}>
    {(title || action) && (
      <div className="px-6 py-4 border-b border-slate-50 dark:border-slate-800 flex items-center justify-between">
        <div>
          {title && <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">{title}</h3>}
          {subtitle && <p className="text-sm text-slate-400 dark:text-slate-500">{subtitle}</p>}
        </div>
        {action}
      </div>
    )}
    <div className="p-6">{children}</div>
  </div>
);

const Input = ({ label, error, ...props }: { label?: string, error?: string } & React.InputHTMLAttributes<HTMLInputElement>) => (
  <div className="space-y-1.5">
    {label && <label className="text-sm font-medium text-slate-700 dark:text-slate-300">{label}</label>}
    <input
      {...props}
      className={cn(
        "w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none",
        error && "border-red-500 focus:ring-red-500/20",
        props.className
      )}
    />
    {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
  </div>
);

const Select = ({ label, options, ...props }: { label?: string, options: { value: string, label: string }[] } & React.SelectHTMLAttributes<HTMLSelectElement>) => (
  <div className="space-y-1.5">
    {label && <label className="text-sm font-medium text-slate-700 dark:text-slate-300">{label}</label>}
    <select
      {...props}
      className={cn(
        "w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none appearance-none",
        props.className
      )}
    >
      {options.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
    </select>
  </div>
);

const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  className, 
  icon: Icon,
  ...props 
}: { 
  children: React.ReactNode, 
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline',
  size?: 'sm' | 'md' | 'lg',
  icon?: any
} & React.ButtonHTMLAttributes<HTMLButtonElement>) => {
  const variants = {
    primary: "bg-indigo-600 text-white hover:bg-indigo-700 shadow-md shadow-indigo-200 dark:shadow-none",
    secondary: "bg-emerald-600 text-white hover:bg-emerald-700 shadow-md shadow-emerald-200 dark:shadow-none",
    danger: "bg-rose-600 text-white hover:bg-rose-700 shadow-md shadow-rose-200 dark:shadow-none",
    ghost: "bg-transparent text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800",
    outline: "bg-transparent border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-indigo-600 dark:hover:border-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-400"
  };
  const sizes = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-5 py-2.5 text-sm",
    lg: "px-8 py-3.5 text-base"
  };

  return (
    <button
      {...props}
      className={cn(
        "inline-flex items-center justify-center gap-2 font-medium rounded-xl transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none",
        variants[variant],
        sizes[size],
        className
      )}
    >
      {Icon && <Icon className="w-4 h-4" />}
      {children}
    </button>
  );
};

// --- Invoice Template ---

const InvoiceTemplate = ({ invoice, company, contact, lang }: { invoice: Invoice, company?: Company, contact?: Contact, lang: 'ar' | 'en' }) => {
  const isAr = lang === 'ar';
  const t = (ar: string, en: string) => isAr ? ar : en;

  if (!company) return <div className="p-8 text-center text-slate-400">Select a company to see preview</div>;

  return (
    <div id="invoice-template" className={cn("bg-white text-slate-800 font-sans p-10 max-w-[800px] mx-auto border border-slate-100 shadow-sm rounded-sm", isAr ? "rtl" : "ltr")} dir={isAr ? "rtl" : "ltr"}>
      {/* Header */}
      <div className="flex justify-between items-start border-b-2 border-slate-800 pb-8 mb-8">
        <div className="space-y-2">
          {company.logo && <img src={company.logo} className="h-16 mb-4 object-contain" />}
          <h1 className="text-2xl font-black text-slate-900">{company.nameAr}</h1>
          <p className="text-sm text-slate-500">{company.nameEn}</p>
          <div className="text-xs space-y-1 text-slate-500">
            <p>{company.address}</p>
            <p>{t('الرقم الضريبي', 'VAT No')}: {company.vat}</p>
            <p>{t('السجل التجاري', 'CR No')}: {company.cr}</p>
          </div>
        </div>
        <div className="text-right space-y-2">
          <h2 className="text-4xl font-black text-slate-200 uppercase tracking-tighter">{t('فاتورة ضريبية', 'Tax Invoice')}</h2>
          <div className="bg-slate-800 text-white p-4 rounded-xl inline-block text-left mt-4">
            <p className="text-[10px] uppercase font-bold opacity-50 mb-1">{t('رقم الفاتورة', 'Invoice Number')}</p>
            <p className="text-xl font-black">{invoice.invoiceNumber}</p>
          </div>
          <div className="text-xs text-slate-500 mt-4">
            <p>{t('التاريخ', 'Date')}: {invoice.date}</p>
            <p>{t('الوقت', 'Time')}: {invoice.time}</p>
          </div>
        </div>
      </div>

      {/* Info Grid */}
      <div className="grid grid-cols-2 gap-12 mb-12">
        <div className="space-y-4">
          <h3 className="text-xs font-black uppercase tracking-widest text-indigo-600 border-b border-indigo-100 pb-2">{t('العميل', 'Bill To')}</h3>
          <div className="space-y-1">
            <p className="font-bold text-lg">{contact?.name || invoice.contactName || 'Walk-in'}</p>
            <p className="text-sm text-slate-500">{contact?.address || (invoice.options?.deliveryDate && `Delivery: ${invoice.options.deliveryDate}`)}</p>
            {contact?.vat && <p className="text-xs text-slate-400">VAT: {contact.vat}</p>}
            {contact?.phone && <p className="text-xs text-slate-400">Tel: {contact.phone}</p>}
          </div>
        </div>
        <div className="space-y-4">
          <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 border-b border-slate-100 pb-2">{t('تفاصيل إضافية', 'Details')}</h3>
          <div className="grid grid-cols-2 gap-y-2 text-xs">
            {invoice.options?.poNumber && (
              <>
                <span className="text-slate-400">{t('رقم أمر الشراء', 'PO Number')}:</span>
                <span className="font-bold">{invoice.options.poNumber}</span>
              </>
            )}
            {invoice.options?.dueDate && (
              <>
                <span className="text-slate-400">{t('تاريخ الاستحقاق', 'Due Date')}:</span>
                <span className="font-bold">{invoice.options.dueDate}</span>
              </>
            )}
            {invoice.options?.period && (
              <>
                <span className="text-slate-400">{t('الفترة', 'Period')}:</span>
                <span className="font-bold">{invoice.options.period}</span>
              </>
            )}
            {invoice.options?.reference && (
              <>
                <span className="text-slate-400">{t('المرجع', 'Reference')}:</span>
                <span className="font-bold">{invoice.options.reference}</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Items Table */}
      <table className="w-full mb-12">
        <thead>
          <tr className="bg-slate-800 text-white text-[10px] uppercase font-bold">
            <th className="px-4 py-3 text-left rounded-l-lg">{t('الصنف', 'Description')}</th>
            <th className="px-4 py-3 text-center">{t('الكمية', 'Qty')}</th>
            <th className="px-4 py-3 text-center">{t('السعر', 'Price')}</th>
            <th className="px-4 py-3 text-center">{t('الضريبة', 'Tax')}</th>
            <th className="px-4 py-3 text-right rounded-r-lg">{t('الإجمالي', 'Total')}</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {(invoice.items || []).map((item, i) => (
            <tr key={i} className="text-sm">
              <td className="px-4 py-4 font-medium">
                <p>{item.name}</p>
                <p className="text-[10px] text-slate-400">{item.sku}</p>
              </td>
              <td className="px-4 py-4 text-center">{item.qty} {item.unit}</td>
              <td className="px-4 py-4 text-center">{item.price.toFixed(2)}</td>
              <td className="px-4 py-4 text-center">{item.tax}%</td>
              <td className="px-4 py-4 text-right font-bold">{(item.qty * item.price * (1 + item.tax/100)).toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Totals & QR */}
      <div className="flex justify-between items-end gap-12">
        <div className="space-y-6 flex-1">
          <div className="p-4 bg-slate-50 rounded-2xl inline-block border border-slate-100">
            <QRCodeSVG value={invoice.qrData || 'PREVIEW'} size={120} level="M" includeMargin={false} />
            <p className="text-[8px] text-center mt-2 text-slate-400 font-bold uppercase tracking-widest">ZATCA Compliant</p>
          </div>
          {invoice.signature && (
            <div className="space-y-2">
              <p className="text-[10px] uppercase font-black text-slate-300 tracking-widest">{t('التوقيع الإلكتروني', 'Electronic Signature')}</p>
              <img src={invoice.signature} className="h-16 opacity-80" />
            </div>
          )}
        </div>
        <div className="w-72 space-y-3">
          <div className="flex justify-between text-sm text-slate-500">
            <span>{t('المجموع الفرعي', 'Subtotal')}</span>
            <span>{invoice.subtotalBefore?.toFixed(2)} {invoice.currency}</span>
          </div>
          <div className="flex justify-between text-sm text-rose-500">
            <span>{t('الخصم', 'Discount')}</span>
            <span>-{ ((invoice.subtotalBefore || 0) - (invoice.afterDiscount || 0)).toFixed(2) } {invoice.currency}</span>
          </div>
          <div className="flex justify-between text-sm text-slate-500">
            <span>{t('الضريبة (15%)', 'VAT (15%)')}</span>
            <span>{invoice.tax?.toFixed(2)} {invoice.currency}</span>
          </div>
          <div className="flex justify-between text-xl font-black text-slate-900 border-t-2 border-slate-900 pt-3">
            <span>{t('الإجمالي', 'Total')}</span>
            <span>{invoice.total?.toFixed(2)} {invoice.currency}</span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-20 pt-8 border-t border-slate-100 text-center space-y-2">
        <p className="text-xs text-slate-400 font-medium">{t('شكراً لتعاملكم معنا', 'Thank you for your business')}</p>
        <div className="flex justify-center gap-4 text-[10px] text-slate-300 font-bold uppercase tracking-widest">
          <span>{company.email}</span>
          <span>•</span>
          <span>{company.phone}</span>
          <span>•</span>
          <span>{company.address}</span>
        </div>
      </div>
    </div>
  );
};

// --- Module Components ---

const Dashboard = ({ invoices, contacts, products, t, theme }: { invoices: Invoice[], contacts: Contact[], products: Product[], t: (k: string) => string, theme: 'light' | 'dark' }) => {
  const totalRevenue = invoices.reduce((acc, inv) => acc + inv.total, 0);
  const totalTax = invoices.reduce((acc, inv) => acc + inv.tax, 0);
  
  const chartData = useMemo(() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return months.map(m => ({
      name: m,
      revenue: invoices
        .filter(inv => new Date(inv.date).getMonth() === months.indexOf(m))
        .reduce((acc, inv) => acc + inv.total, 0),
      tax: invoices
        .filter(inv => new Date(inv.date).getMonth() === months.indexOf(m))
        .reduce((acc, inv) => acc + inv.tax, 0)
    }));
  }, [invoices]);

  const topCustomers = useMemo(() => {
    const customerTotals: Record<string, number> = {};
    invoices.forEach(inv => {
      const name = inv.contactName || 'Walk-in';
      customerTotals[name] = (customerTotals[name] || 0) + inv.total;
    });
    return Object.entries(customerTotals)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([name, total]) => ({ name, total }));
  }, [invoices]);

  const topProducts = useMemo(() => {
    const productTotals: Record<string, number> = {};
    invoices.forEach(inv => {
      inv.items.forEach(item => {
        productTotals[item.name] = (productTotals[item.name] || 0) + item.qty;
      });
    });
    return Object.entries(productTotals)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([name, qty]) => ({ name, qty }));
  }, [invoices]);

  const COLORS = ['#0066cc', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-indigo-600 text-white border-none shadow-indigo-100 dark:shadow-none">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-white/10 rounded-lg"><BarChart3 className="w-5 h-5" /></div>
          </div>
          <p className="text-white/70 text-sm mb-1">{t('totalRevenue')}</p>
          <h2 className="text-2xl font-bold">{totalRevenue.toLocaleString()} SAR</h2>
        </Card>
        <Card title={t('activeInvoices')} subtitle="Total generated invoices">
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">{invoices.length}</h2>
        </Card>
        <Card title={t('totalCustomers')} subtitle="Registered clients">
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">{contacts.length}</h2>
        </Card>
        <Card title={t('monthlyTax')} subtitle="Total tax collected">
          <h2 className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{totalTax.toLocaleString()} SAR</h2>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card title="Revenue & Tax Overview" className="lg:col-span-2">
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <Tooltip 
                  cursor={{ fill: theme === 'dark' ? '#1e293b' : '#f8fafc' }}
                  contentStyle={{ 
                    borderRadius: '12px', 
                    border: 'none', 
                    boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                    backgroundColor: theme === 'dark' ? '#0f172a' : '#ffffff',
                    color: theme === 'dark' ? '#f1f5f9' : '#1e293b'
                  }}
                />
                <Bar dataKey="revenue" fill="#0066cc" radius={[4, 4, 0, 0]} barSize={20} />
                <Bar dataKey="tax" fill="#10b981" radius={[4, 4, 0, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card title={t('topCustomers')}>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={topCustomers}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="total"
                >
                  {topCustomers.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 space-y-2">
            {topCustomers.map((c, i) => (
              <div key={c.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                  <span className="text-slate-600 dark:text-slate-400 truncate max-w-[120px]">{c.name}</span>
                </div>
                <span className="font-bold text-slate-800 dark:text-slate-100">{c.total.toLocaleString()} SAR</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title={t('topProducts')}>
          <div className="space-y-4">
            {topProducts.map((p, i) => (
              <div key={p.name} className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-xs font-bold text-slate-400">
                  0{i + 1}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{p.name}</span>
                    <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400">{p.qty} units</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5">
                    <div 
                      className="bg-indigo-600 dark:bg-indigo-500 h-1.5 rounded-full" 
                      style={{ width: `${(p.qty / (topProducts[0]?.qty || 1)) * 100}%` }} 
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
        <Card title={t('recentInvoices')}>
          <div className="space-y-4">
            {invoices.slice(-5).reverse().map(inv => (
              <div key={inv.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">{inv.invoiceNumber}</p>
                    <p className="text-xs text-slate-400 dark:text-slate-500">{inv.contactName || 'Walk-in'}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-slate-800 dark:text-slate-100">{inv.total.toLocaleString()} SAR</p>
                  <p className="text-[10px] text-emerald-500 font-medium">{inv.date}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

const Companies = ({ companies, setCompanies, t }: { companies: Company[], setCompanies: (c: Company[]) => void, t: (k: string) => string }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState<Partial<Company>>({ currency: 'SAR' });

  const handleSave = () => {
    if (!formData.nameAr || !formData.address || !formData.postal) {
      Swal.fire('Error', 'Please fill all required fields', 'error');
      return;
    }
    const newCompany = { ...formData, id: formData.id || Date.now().toString() } as Company;
    if (formData.id) setCompanies(companies.map(c => c.id === formData.id ? newCompany : c));
    else setCompanies([...companies, newCompany]);
    setIsAdding(false);
    setFormData({ currency: 'SAR' });
  };

  const currencies = [
    { value: 'SAR', label: 'SAR' },
    { value: 'USD', label: 'USD' },
    { value: 'EUR', label: 'EUR' },
    { value: 'EGP', label: 'EGP' },
    { value: 'AED', label: 'AED' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">{t('companies')}</h2>
        <Button icon={Plus} onClick={() => setIsAdding(true)}>{t('newCompany')}</Button>
      </div>
      {isAdding && (
        <Card title={formData.id ? t('edit') : t('newCompany')}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="Name (Arabic) *" value={formData.nameAr || ''} onChange={e => setFormData({...formData, nameAr: e.target.value})} />
            <Input label="Name (English) *" value={formData.nameEn || ''} onChange={e => setFormData({...formData, nameEn: e.target.value})} />
            <Input label={t('vatNumber')} value={formData.vat || ''} onChange={e => setFormData({...formData, vat: e.target.value})} />
            <Input label="Commercial Register (CR)" value={formData.cr || ''} onChange={e => setFormData({...formData, cr: e.target.value})} />
            <Input label={t('address') + " *"} value={formData.address || ''} onChange={e => setFormData({...formData, address: e.target.value})} />
            <Input label="Postal Code *" value={formData.postal || ''} onChange={e => setFormData({...formData, postal: e.target.value})} />
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Company Logo</label>
              <div className="flex items-center gap-4">
                {formData.logo && <img src={formData.logo} className="w-12 h-12 rounded-xl object-contain border border-slate-200" />}
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={e => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        setFormData({...formData, logo: reader.result as string});
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                  className="flex-1 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-600 hover:file:bg-indigo-100"
                />
              </div>
            </div>
            <Input label="Email" value={formData.email || ''} onChange={e => setFormData({...formData, email: e.target.value})} />
            <Input label="Phone" value={formData.phone || ''} onChange={e => setFormData({...formData, phone: e.target.value})} />
            <Select label="Default Currency" value={formData.currency} onChange={e => setFormData({...formData, currency: e.target.value})} options={currencies} />
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <Button variant="ghost" onClick={() => setIsAdding(false)}>{t('cancel')}</Button>
            <Button onClick={handleSave}>{t('save')}</Button>
          </div>
        </Card>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {companies.map(c => (
          <div key={c.id}>
            <Card className="group relative">
              <div className="flex items-center gap-4 mb-4">
                {c.logo ? (
                  <img src={c.logo} className="w-12 h-12 rounded-xl object-contain border border-slate-100" />
                ) : (
                  <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold">
                    {c.nameAr.charAt(0)}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-slate-800 truncate">{c.nameAr}</h4>
                  <p className="text-xs text-slate-400 truncate">{c.nameEn}</p>
                </div>
              </div>
              <div className="space-y-1 mb-4 text-xs text-slate-500">
                <p><span className="font-medium">VAT:</span> {c.vat || 'N/A'}</p>
                <p><span className="font-medium">CR:</span> {c.cr || 'N/A'}</p>
                <p className="truncate"><span className="font-medium">Addr:</span> {c.address}</p>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" className="flex-1" onClick={() => { setFormData(c); setIsAdding(true); }}>{t('edit')}</Button>
                <Button size="sm" variant="danger" onClick={() => {
                  Swal.fire({
                    title: 'Are you sure?',
                    text: "You won't be able to revert this!",
                    icon: 'warning',
                    showCancelButton: true,
                    confirmButtonColor: '#ef4444',
                    confirmButtonText: 'Yes, delete it!'
                  }).then((result) => {
                    if (result.isConfirmed) setCompanies(companies.filter(comp => comp.id !== c.id));
                  });
                }}><Trash2 className="w-4 h-4" /></Button>
              </div>
            </Card>
          </div>
        ))}
      </div>
    </div>
  );
};

const Contacts = ({ contacts, setContacts, companies, t }: { contacts: Contact[], setContacts: (c: Contact[]) => void, companies: Company[], t: (k: string) => string }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState<Partial<Contact>>({});
  const [filterCompany, setFilterCompany] = useState('');

  const handleSave = () => {
    if (!formData.name || !formData.companyId) {
      Swal.fire('Error', 'Name and Company are required', 'error');
      return;
    }
    const newContact = { ...formData, id: formData.id || Date.now().toString() } as Contact;
    if (formData.id) setContacts(contacts.map(c => c.id === formData.id ? newContact : c));
    else setContacts([...contacts, newContact]);
    setIsAdding(false);
    setFormData({});
  };

  const filteredContacts = filterCompany 
    ? contacts.filter(c => c.companyId === filterCompany)
    : contacts;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">{t('contacts')}</h2>
          <Select 
            className="w-48"
            value={filterCompany} 
            onChange={e => setFilterCompany(e.target.value)} 
            options={[{ value: '', label: 'All Companies' }, ...companies.map(c => ({ value: c.id, label: c.nameAr }))]} 
          />
        </div>
        <Button icon={Plus} onClick={() => setIsAdding(true)}>{t('newContact')}</Button>
      </div>
      {isAdding && (
        <Card title={formData.id ? t('edit') : t('newContact')}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select label="Company *" value={formData.companyId} onChange={e => setFormData({...formData, companyId: e.target.value})} options={[{ value: '', label: 'Select Company' }, ...companies.map(c => ({ value: c.id, label: c.nameAr }))]} />
            <Input label="Name *" value={formData.name || ''} onChange={e => setFormData({...formData, name: e.target.value})} />
            <Input label={t('vatNumber')} value={formData.vat || ''} onChange={e => setFormData({...formData, vat: e.target.value})} />
            <Input label="CR Number" value={formData.cr || ''} onChange={e => setFormData({...formData, cr: e.target.value})} />
            <Input label={t('address')} value={formData.address || ''} onChange={e => setFormData({...formData, address: e.target.value})} />
            <Input label={t('phone')} value={formData.phone || ''} onChange={e => setFormData({...formData, phone: e.target.value})} />
            <Input label={t('email')} value={formData.email || ''} onChange={e => setFormData({...formData, email: e.target.value})} />
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <Button variant="ghost" onClick={() => setIsAdding(false)}>{t('cancel')}</Button>
            <Button onClick={handleSave}>{t('save')}</Button>
          </div>
        </Card>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredContacts.map(c => (
          <div key={c.id}>
            <Card className="group dark:bg-slate-900">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 dark:text-slate-100">{c.name}</h4>
                  <p className="text-xs text-indigo-600 dark:text-indigo-400 font-medium">{companies.find(comp => comp.id === c.companyId)?.nameAr}</p>
                </div>
              </div>
              <div className="space-y-1 mb-4 text-xs text-slate-500 dark:text-slate-400">
                {c.email && <p className="flex items-center gap-2"><FileText className="w-3 h-3" /> {c.email}</p>}
                {c.phone && <p className="flex items-center gap-2"><FileText className="w-3 h-3" /> {c.phone}</p>}
                {c.vat && <p className="flex items-center gap-2"><FileText className="w-3 h-3" /> VAT: {c.vat}</p>}
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" className="flex-1" onClick={() => { setFormData(c); setIsAdding(true); }}>{t('edit')}</Button>
                <Button size="sm" variant="danger" onClick={() => setContacts(contacts.filter(con => con.id !== c.id))}><Trash2 className="w-4 h-4" /></Button>
              </div>
            </Card>
          </div>
        ))}
      </div>
    </div>
  );
};

const Products = ({ products, setProducts, t }: { products: Product[], setProducts: (p: Product[]) => void, t: (k: string) => string }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState<Partial<Product>>({ tax: 15, unit: 'pcs' });

  const handleSave = () => {
    if (!formData.sku || !formData.name || !formData.price) {
      Swal.fire('Error', 'SKU, Name and Price are required', 'error');
      return;
    }
    const newProduct = { ...formData, id: formData.id || Date.now().toString() } as Product;
    if (formData.id) setProducts(products.map(p => p.id === formData.id ? newProduct : p));
    else setProducts([...products, newProduct]);
    setIsAdding(false);
    setFormData({ tax: 15, unit: 'pcs' });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">{t('products')}</h2>
        <Button icon={Plus} onClick={() => setIsAdding(true)}>{t('newProduct')}</Button>
      </div>
      {isAdding && (
        <Card title={formData.id ? t('edit') : t('newProduct')}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Input label="SKU *" value={formData.sku || ''} onChange={e => setFormData({...formData, sku: e.target.value})} />
            <Input label="Name *" value={formData.name || ''} onChange={e => setFormData({...formData, name: e.target.value})} />
            <Input label="Unit" placeholder="e.g. pcs, kg, hour" value={formData.unit || ''} onChange={e => setFormData({...formData, unit: e.target.value})} />
            <Input label={t('price') + " *"} type="number" value={formData.price || ''} onChange={e => setFormData({...formData, price: Number(e.target.value)})} />
            <Input label={t('tax') + ' % *'} type="number" value={formData.tax || ''} onChange={e => setFormData({...formData, tax: Number(e.target.value)})} />
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <Button variant="ghost" onClick={() => setIsAdding(false)}>{t('cancel')}</Button>
            <Button onClick={handleSave}>{t('save')}</Button>
          </div>
        </Card>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {products.map(p => (
          <div key={p.id}>
            <Card className="group dark:bg-slate-900">
              <div className="flex items-center justify-between mb-4">
                <div className="px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  {p.sku}
                </div>
                <div className="text-xs font-medium text-emerald-500">Tax: {p.tax}%</div>
              </div>
              <h4 className="font-bold text-slate-800 dark:text-slate-100 mb-1">{p.name}</h4>
              <p className="text-xs text-slate-400 dark:text-slate-500 mb-4">{p.unit}</p>
              <div className="flex items-end justify-between">
                <p className="text-xl font-black text-indigo-600 dark:text-indigo-400">{p.price.toLocaleString()} <span className="text-xs font-normal">SAR</span></p>
                <div className="flex gap-1">
                  <button onClick={() => { setFormData(p); setIsAdding(true); }} className="p-2 text-slate-400 hover:text-indigo-600 transition-colors"><Edit3 className="w-4 h-4" /></button>
                  <button onClick={() => setProducts(products.filter(prod => prod.id !== p.id))} className="p-2 text-slate-400 hover:text-rose-600 transition-colors"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
            </Card>
          </div>
        ))}
      </div>
    </div>
  );
};

const InvoiceBuilder = ({ companies, contacts, invoices, setInvoices, setActiveTab, lang, t }: { companies: Company[], contacts: Contact[], invoices: Invoice[], setInvoices: (i: Invoice[]) => void, setActiveTab: (t: string) => void, lang: 'ar' | 'en', t: (k: string) => string }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<Partial<Invoice>>({
    invoiceNumber: `INV-${Date.now().toString().slice(-6)}`,
    date: format(new Date(), 'yyyy-MM-dd'),
    time: format(new Date(), 'HH:mm'),
    items: [],
    discountValue: 0,
    discountType: 'fixed',
    invoiceType: 'simple',
    options: {}
  });

  const signatureRef = useRef<HTMLCanvasElement>(null);

  const subtotal = formData.items?.reduce((acc, item) => acc + (item.price * item.qty), 0) || 0;
  const discount = formData.discountType === 'percentage' ? (subtotal * (formData.discountValue || 0) / 100) : (formData.discountValue || 0);
  const afterDiscount = subtotal - discount;
  const tax = formData.items?.reduce((acc, item) => {
    const itemSub = item.price * item.qty;
    const itemDiscount = formData.discountType === 'percentage' ? (itemSub * (formData.discountValue || 0) / 100) : ((itemSub / subtotal) * (formData.discountValue || 0));
    return acc + ((itemSub - itemDiscount) * (item.tax / 100));
  }, 0) || 0;
  const total = afterDiscount + tax;

  const handleSave = () => {
    if (!formData.companyId || !formData.items?.length) {
      Swal.fire('Error', 'Company and Items are required', 'error');
      return;
    }
    
    const company = companies.find(c => c.id === formData.companyId)!;
    const qrData = generateZatcaQRData(
      company.nameAr,
      company.vat || '',
      `${formData.date}T${formData.time}:00Z`,
      total.toFixed(2),
      tax.toFixed(2)
    );

    const newInvoice = {
      ...formData,
      id: Date.now().toString(),
      companyName: company.nameAr,
      currency: company.currency,
      subtotalBefore: subtotal,
      afterDiscount,
      tax,
      total,
      qrData
    } as Invoice;

    setInvoices([...invoices, newInvoice]);
    Swal.fire('Success', 'Invoice saved successfully', 'success');
    setActiveTab('invoices');
  };

  const clearSignature = () => {
    const canvas = signatureRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx?.clearRect(0, 0, canvas.width, canvas.height);
      setFormData({ ...formData, signature: undefined });
    }
  };

  const saveSignature = () => {
    const canvas = signatureRef.current;
    if (canvas) {
      const dataUrl = canvas.toDataURL();
      setFormData({ ...formData, signature: dataUrl });
      Swal.fire({ title: t('saveSignature'), icon: 'success', toast: true, position: 'top-end', timer: 2000, showConfirmButton: false });
    }
  };

  const initCanvas = () => {
    const canvas = signatureRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#000';
    let drawing = false;

    const getPos = (e: any) => {
      const rect = canvas.getBoundingClientRect();
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      return { x: clientX - rect.left, y: clientY - rect.top };
    };

    const start = (e: any) => { drawing = true; const pos = getPos(e); ctx.beginPath(); ctx.moveTo(pos.x, pos.y); };
    const move = (e: any) => { if (!drawing) return; const pos = getPos(e); ctx.lineTo(pos.x, pos.y); ctx.stroke(); };
    const stop = () => { drawing = false; };

    canvas.addEventListener('mousedown', start);
    canvas.addEventListener('mousemove', move);
    window.addEventListener('mouseup', stop);
    canvas.addEventListener('touchstart', start);
    canvas.addEventListener('touchmove', move);
    canvas.addEventListener('touchend', stop);
  };

  useEffect(() => { if (step === 3) setTimeout(initCanvas, 100); }, [step]);

  const handleExportPDF = () => {
    const element = document.getElementById('invoice-preview');
    if (!element) return;
    const opt = {
      margin: 10,
      filename: `${formData.invoiceNumber}.pdf`,
      image: { type: 'jpeg' as const, quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' as const }
    };
    html2pdf().set(opt).from(element).save();
  };

  const handleSendEmail = () => {
    const company = companies.find(c => c.id === formData.companyId);
    const contact = contacts.find(c => c.id === formData.contactId);
    const subject = `Invoice ${formData.invoiceNumber} from ${company?.nameAr || 'Our Company'}`;
    const body = `Hello ${contact?.name || 'Customer'},\n\nPlease find the details of your invoice below:\n\nInvoice Number: ${formData.invoiceNumber}\nDate: ${formData.date}\nTotal: ${total.toFixed(2)} ${company?.currency || 'SAR'}\n\nThank you!`;
    window.location.href = `mailto:${contact?.email || ''}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">{t('createInvoice')}</h2>
        <div className="flex gap-2">
          {[1, 2, 3, 4].map(s => (
            <div key={s} className={cn("w-8 h-2 rounded-full transition-all", step >= s ? "bg-indigo-600" : "bg-slate-200 dark:bg-slate-700")} />
          ))}
        </div>
      </div>

      {step === 1 && (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
          <Card title="Basic Information">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Select label="Seller Company *" value={formData.companyId} onChange={e => setFormData({...formData, companyId: e.target.value})} options={[{ value: '', label: 'Select Company' }, ...companies.map(c => ({ value: c.id, label: c.nameAr }))]} />
              <Select label="Buyer Contact" value={formData.contactId} onChange={e => {
                const contact = contacts.find(c => c.id === e.target.value);
                setFormData({...formData, contactId: e.target.value, contactName: contact?.name});
              }} options={[{ value: '', label: 'Walk-in' }, ...contacts.filter(c => c.companyId === formData.companyId).map(c => ({ value: c.id, label: c.name }))]} />
              <Input label={t('invoiceNo')} value={formData.invoiceNumber || ''} onChange={e => setFormData({...formData, invoiceNumber: e.target.value})} />
              <div className="grid grid-cols-2 gap-4">
                <Input label={t('date')} type="date" value={formData.date || ''} onChange={e => setFormData({...formData, date: e.target.value})} />
                <Input label="Time" type="time" value={formData.time || ''} onChange={e => setFormData({...formData, time: e.target.value})} />
              </div>
              <Select label={t('type')} value={formData.invoiceType} onChange={e => setFormData({...formData, invoiceType: e.target.value as any})} options={[{ value: 'simple', label: t('simple') }, { value: 'complex', label: t('complex') }]} />
            </div>
            <div className="flex justify-end mt-8">
              <Button onClick={() => setStep(2)}>Next: Items</Button>
            </div>
          </Card>
        </motion.div>
      )}

      {step === 2 && (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
          <Card title={t('items')}>
            <div className="space-y-4">
              {formData.items?.map((item, idx) => (
                <div key={idx} className="flex gap-4 items-end bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl relative group">
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Input label="Item Name" value={item.name} onChange={e => {
                      const newItems = [...formData.items!];
                      newItems[idx].name = e.target.value;
                      setFormData({...formData, items: newItems});
                    }} />
                    <Input label={t('qty')} type="number" value={item.qty} onChange={e => {
                      const newItems = [...formData.items!];
                      newItems[idx].qty = Number(e.target.value);
                      setFormData({...formData, items: newItems});
                    }} />
                    <Input label={t('price')} type="number" value={item.price} onChange={e => {
                      const newItems = [...formData.items!];
                      newItems[idx].price = Number(e.target.value);
                      setFormData({...formData, items: newItems});
                    }} />
                    <Input label={t('tax') + ' %'} type="number" value={item.tax} onChange={e => {
                      const newItems = [...formData.items!];
                      newItems[idx].tax = Number(e.target.value);
                      setFormData({...formData, items: newItems});
                    }} />
                  </div>
                  <Button variant="danger" size="sm" onClick={() => {
                    const newItems = formData.items!.filter((_, i) => i !== idx);
                    setFormData({...formData, items: newItems});
                  }}><Trash2 className="w-4 h-4" /></Button>
                </div>
              ))}
              <Button variant="outline" icon={Plus} onClick={() => setFormData({...formData, items: [...(formData.items || []), { name: '', qty: 1, price: 0, tax: 15, total: 0 }]})}>
                {t('addItem')}
              </Button>
            </div>
            <div className="mt-8 p-6 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl flex flex-col md:flex-row justify-between gap-6">
              <div className="flex-1 space-y-4">
                <div className="flex items-center gap-4">
                  <Select className="w-32" label={t('discount')} value={formData.discountType} onChange={e => setFormData({...formData, discountType: e.target.value as any})} options={[{ value: 'fixed', label: t('fixed') }, { value: 'percentage', label: t('percentage') }]} />
                  <Input className="flex-1" label="Value" type="number" value={formData.discountValue || 0} onChange={e => setFormData({...formData, discountValue: Number(e.target.value)})} />
                </div>
              </div>
              <div className="text-right space-y-1">
                <p className="text-slate-500 dark:text-slate-400 text-sm">{t('subtotal')}: {subtotal.toFixed(2)} SAR</p>
                <p className="text-rose-500 text-sm">{t('discount')}: -{discount.toFixed(2)} SAR</p>
                <p className="text-slate-500 dark:text-slate-400 text-sm">{t('tax')}: {tax.toFixed(2)} SAR</p>
                <p className="text-2xl font-black text-indigo-600 dark:text-indigo-400">{t('grandTotal')}: {total.toFixed(2)} SAR</p>
              </div>
            </div>
            <div className="flex justify-between mt-8">
              <Button variant="ghost" onClick={() => setStep(1)}>Back</Button>
              <Button onClick={() => setStep(3)}>Next: Options & Signature</Button>
            </div>
          </Card>
        </motion.div>
      )}

      {step === 3 && (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card title="Additional Options">
              <div className="grid grid-cols-1 gap-4">
                <Input label={t('poNumber')} value={formData.options?.poNumber || ''} onChange={e => setFormData({...formData, options: {...formData.options, poNumber: e.target.value}})} />
                <Input label={t('dueDate')} type="date" value={formData.options?.dueDate || ''} onChange={e => setFormData({...formData, options: {...formData.options, dueDate: e.target.value}})} />
                <Input label={t('deliveryDate')} type="date" value={formData.options?.deliveryDate || ''} onChange={e => setFormData({...formData, options: {...formData.options, deliveryDate: e.target.value}})} />
                <Input label={t('period')} placeholder="e.g. Jan 2024" value={formData.options?.period || ''} onChange={e => setFormData({...formData, options: {...formData.options, period: e.target.value}})} />
                <Input label={t('reference')} value={formData.options?.reference || ''} onChange={e => setFormData({...formData, options: {...formData.options, reference: e.target.value}})} />
              </div>
            </Card>
            <Card title={t('signature')}>
              <div className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl p-4 bg-white">
                <canvas 
                  ref={signatureRef} 
                  width={400} 
                  height={200} 
                  className="w-full h-[200px] touch-none cursor-crosshair"
                />
              </div>
              <div className="flex gap-2 mt-4">
                <Button variant="outline" size="sm" className="flex-1" onClick={clearSignature}>{t('clear')}</Button>
                <Button size="sm" className="flex-1" onClick={saveSignature}>{t('saveSignature')}</Button>
              </div>
              {formData.signature && (
                <div className="mt-4 p-2 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg flex items-center gap-2 text-emerald-600 dark:text-emerald-400 text-xs">
                  <CheckCircle2 className="w-4 h-4" /> Signature captured
                </div>
              )}
            </Card>
          </div>
          <div className="flex justify-between mt-8">
            <Button variant="ghost" onClick={() => setStep(2)}>Back</Button>
            <Button onClick={() => setStep(4)}>Next: Preview</Button>
          </div>
        </motion.div>
      )}

      {step === 4 && (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
          <div className="bg-white dark:bg-slate-900 shadow-2xl rounded-3xl overflow-hidden border border-slate-100 dark:border-slate-800">
            <div className="p-4 bg-slate-50 dark:bg-slate-800 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Live Preview</span>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" icon={Printer} onClick={() => window.print()}>{t('print')}</Button>
                <Button variant="outline" size="sm" icon={FileDown} onClick={handleExportPDF}>PDF</Button>
                <Button variant="outline" size="sm" icon={Mail} onClick={handleSendEmail}>Email</Button>
              </div>
            </div>
            <div className="p-8 overflow-x-auto bg-slate-100 dark:bg-slate-950">
              <div id="invoice-preview">
                <InvoiceTemplate 
                  invoice={{
                    ...formData,
                    companyName: companies.find(c => c.id === formData.companyId)?.nameAr || 'Company Name',
                    currency: companies.find(c => c.id === formData.companyId)?.currency || 'SAR',
                    subtotalBefore: subtotal,
                    afterDiscount,
                    tax,
                    total,
                    qrData: 'PREVIEW_QR_DATA'
                  } as Invoice} 
                  company={companies.find(c => c.id === formData.companyId)!}
                  contact={contacts.find(c => c.id === formData.contactId)!}
                  lang={lang}
                />
              </div>
            </div>
          </div>
          <div className="flex justify-between mt-8">
            <Button variant="ghost" onClick={() => setStep(3)}>Back</Button>
            <Button onClick={handleSave} icon={Save}>{t('saveInvoice')}</Button>
          </div>
        </motion.div>
      )}
    </div>
  );
};

const Invoices = ({ invoices, setInvoices, setActiveTab, t, companies, contacts, setSelectedInvoice }: { invoices: Invoice[], setInvoices: (i: Invoice[]) => void, setActiveTab: (t: string) => void, t: (k: string) => string, companies: Company[], contacts: Contact[], setSelectedInvoice: (i: Invoice) => void }) => {
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('');

  const filteredInvoices = invoices.filter(inv => {
    const matchesSearch = inv.invoiceNumber.toLowerCase().includes(search.toLowerCase()) || 
                          inv.contactName?.toLowerCase().includes(search.toLowerCase());
    const matchesType = filterType ? inv.invoiceType === filterType : true;
    return matchesSearch && matchesType;
  });

  const handleExportPDF = (inv: Invoice) => {
    // For existing invoices, we might need a temporary render or just use the data
    // Since we have the InvoiceTemplate, we can render it off-screen
    const company = companies.find(c => c.id === inv.companyId);
    const contact = contacts.find(c => c.id === inv.contactId);
    
    const div = document.createElement('div');
    div.id = 'temp-invoice-export';
    div.style.position = 'absolute';
    div.style.left = '-9999px';
    document.body.appendChild(div);

    // We can't easily render a React component to a string and then to DOM here without more setup
    // But we can use a simpler approach: if they click "Eye", they see the preview, and they can export from there.
    // Or I can implement a quick "View" mode that has the export button.
    
    // For now, let's just provide the Email function and a note that they can export from the preview.
    Swal.fire('Info', 'To export as PDF, please click the View (Eye) icon and use the PDF button in the preview.', 'info');
  };

  const handleSendEmail = (inv: Invoice) => {
    const company = companies.find(c => c.id === inv.companyId);
    const contact = contacts.find(c => c.id === inv.contactId);
    const subject = `Invoice ${inv.invoiceNumber} from ${company?.nameAr || 'Our Company'}`;
    const body = `Hello ${inv.contactName || 'Customer'},\n\nPlease find the details of your invoice below:\n\nInvoice Number: ${inv.invoiceNumber}\nDate: ${inv.date}\nTotal: ${inv.total.toLocaleString()} ${inv.currency}\n\nThank you!`;
    window.location.href = `mailto:${contact?.email || ''}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">{t('invoices')}</h2>
        <Button icon={Plus} onClick={() => setActiveTab('create-invoice')}>{t('createInvoice')}</Button>
      </div>
      
      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            placeholder={t('search')} 
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 outline-none"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <Select 
          className="w-48"
          value={filterType} 
          onChange={e => setFilterType(e.target.value)} 
          options={[
            { value: '', label: 'All Types' },
            { value: 'simple', label: t('simple') },
            { value: 'complex', label: t('complex') }
          ]} 
        />
      </div>

      <Card className="p-0 overflow-hidden dark:bg-slate-900">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 dark:bg-slate-800 text-[10px] uppercase text-slate-400 dark:text-slate-500 font-bold tracking-wider">
              <tr>
                <th className="px-6 py-4">{t('invoiceNo')}</th>
                <th className="px-6 py-4">{t('customer')}</th>
                <th className="px-6 py-4">{t('date')}</th>
                <th className="px-6 py-4">{t('type')}</th>
                <th className="px-6 py-4">{t('total')}</th>
                <th className="px-6 py-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredInvoices.map(inv => (
                <tr key={inv.id} className="text-sm hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="px-6 py-4 font-bold text-slate-700 dark:text-slate-300">{inv.invoiceNumber}</td>
                  <td className="px-6 py-4 text-slate-500 dark:text-slate-400">{inv.contactName || 'Walk-in'}</td>
                  <td className="px-6 py-4 text-slate-500 dark:text-slate-400">{inv.date}</td>
                  <td className="px-6 py-4">
                    <span className={cn("px-2 py-0.5 rounded-full text-[10px] font-bold uppercase", inv.invoiceType === 'complex' ? "bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400" : "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400")}>
                      {t(inv.invoiceType)}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-bold text-indigo-600 dark:text-indigo-400">{inv.total.toLocaleString()} {inv.currency}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => { setSelectedInvoice(inv); setActiveTab('view-invoice'); }} className="p-2 text-slate-400 hover:text-indigo-600 transition-colors" title="View"><Eye className="w-4 h-4" /></button>
                      <button onClick={() => handleSendEmail(inv)} className="p-2 text-slate-400 hover:text-indigo-600 transition-colors" title="Email"><Mail className="w-4 h-4" /></button>
                      <button onClick={() => setInvoices(invoices.filter(i => i.id !== inv.id))} className="p-2 text-slate-400 hover:text-rose-600 transition-colors" title="Delete"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

const Recurring = ({ recurringInvoices, setRecurringInvoices, companies, contacts, t }: { recurringInvoices: RecurringInvoice[], setRecurringInvoices: (r: RecurringInvoice[]) => void, companies: Company[], contacts: Contact[], t: (k: string) => string }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState<Partial<RecurringInvoice>>({ frequency: 'monthly', startDate: format(new Date(), 'yyyy-MM-dd') });

  const handleSave = () => {
    if (!formData.companyId || !formData.amount || !formData.startDate) {
      Swal.fire('Error', 'Please fill required fields', 'error');
      return;
    }
    const newRec = { ...formData, id: formData.id || Date.now().toString() } as RecurringInvoice;
    if (formData.id) setRecurringInvoices(recurringInvoices.map(r => r.id === formData.id ? newRec : r));
    else setRecurringInvoices([...recurringInvoices, newRec]);
    setIsAdding(false);
    setFormData({ frequency: 'monthly', startDate: format(new Date(), 'yyyy-MM-dd') });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">{t('recurring')}</h2>
        <Button icon={Plus} onClick={() => setIsAdding(true)}>{t('newProduct')}</Button>
      </div>

      {isAdding && (
        <Card title={t('recurring')}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Select label="Company *" value={formData.companyId} onChange={e => setFormData({...formData, companyId: e.target.value})} options={[{ value: '', label: 'Select Company' }, ...companies.map(c => ({ value: c.id, label: c.nameAr }))]} />
            <Select label="Customer" value={formData.contactId} onChange={e => setFormData({...formData, contactId: e.target.value})} options={[{ value: '', label: 'Walk-in' }, ...contacts.filter(c => c.companyId === formData.companyId).map(c => ({ value: c.id, label: c.name }))]} />
            <Input label={t('amount') + " *"} type="number" value={formData.amount || ''} onChange={e => setFormData({...formData, amount: Number(e.target.value)})} />
            <Select label={t('frequency')} value={formData.frequency} onChange={e => setFormData({...formData, frequency: e.target.value as any})} options={[{ value: 'daily', label: t('daily') }, { value: 'monthly', label: t('monthly') }, { value: 'yearly', label: t('yearly') }]} />
            <Input label={t('startDate')} type="date" value={formData.startDate} onChange={e => setFormData({...formData, startDate: e.target.value})} />
            <Input label={t('endDate')} type="date" value={formData.endDate || ''} onChange={e => setFormData({...formData, endDate: e.target.value})} />
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <Button variant="ghost" onClick={() => setIsAdding(false)}>{t('cancel')}</Button>
            <Button onClick={handleSave}>{t('save')}</Button>
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {recurringInvoices.map(rec => (
          <Card key={rec.id} className="relative overflow-hidden dark:bg-slate-900">
            <div className="absolute top-0 right-0 p-4">
              <span className="px-2 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-[10px] font-bold uppercase">{rec.frequency}</span>
            </div>
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 dark:text-slate-500">
                <RefreshCw className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-slate-800 dark:text-slate-100">{companies.find(c => c.id === rec.companyId)?.nameAr}</h4>
                <p className="text-xs text-slate-400 dark:text-slate-500">{contacts.find(c => c.id === rec.contactId)?.name || 'Walk-in'}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-bold tracking-wider mb-1">{t('amount')}</p>
                <p className="text-lg font-black text-slate-800 dark:text-slate-100">{rec.amount.toLocaleString()} SAR</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-bold tracking-wider mb-1">Last Generated</p>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">{rec.lastGenerated || 'Never'}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" className="flex-1" onClick={() => { setFormData(rec); setIsAdding(true); }}>{t('edit')}</Button>
              <Button size="sm" variant="danger" onClick={() => setRecurringInvoices(recurringInvoices.filter(r => r.id !== rec.id))}><Trash2 className="w-4 h-4" /></Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

const Reports = ({ invoices, t, theme }: { invoices: Invoice[], t: (k: string) => string, theme: 'light' | 'dark' }) => {
  const stats = useMemo(() => {
    const total = invoices.reduce((acc, inv) => acc + inv.total, 0);
    const tax = invoices.reduce((acc, inv) => acc + inv.tax, 0);
    const count = invoices.length;
    return { total, tax, count };
  }, [invoices]);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">{t('reports')}</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card title="Total Sales" className="bg-indigo-600 text-white border-none shadow-indigo-100 dark:shadow-none">
          <h2 className="text-3xl font-black">{stats.total.toLocaleString()} SAR</h2>
        </Card>
        <Card title="Total Tax" className="bg-emerald-600 text-white border-none shadow-emerald-100 dark:shadow-none">
          <h2 className="text-3xl font-black">{stats.tax.toLocaleString()} SAR</h2>
        </Card>
        <Card title="Invoice Count" className="bg-slate-800 dark:bg-slate-900 text-white border-none">
          <h2 className="text-3xl font-black">{stats.count}</h2>
        </Card>
      </div>
      <Dashboard invoices={invoices} contacts={[]} products={[]} t={t} theme={theme} />
    </div>
  );
};

// --- Main App ---

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [lang, setLang] = useState<'ar' | 'en'>('en');
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Data State
  const [companies, setCompanies] = useState<Company[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [recurringInvoices, setRecurringInvoices] = useState<RecurringInvoice[]>([]);

  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  // Theme Effect
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      root.setAttribute('data-theme', 'dark');
      root.style.colorScheme = 'dark';
    } else {
      root.classList.remove('dark');
      root.setAttribute('data-theme', 'light');
      root.style.colorScheme = 'light';
    }
  }, [theme]);

  // Load Initial Data
  useEffect(() => {
    const savedCompanies = localStorage.getItem('companies');
    const savedContacts = localStorage.getItem('contacts');
    const savedProducts = localStorage.getItem('products');
    const savedInvoices = localStorage.getItem('invoices');
    const savedRecurring = localStorage.getItem('recurringInvoices');

    if (savedCompanies) setCompanies(JSON.parse(savedCompanies));
    if (savedContacts) setContacts(JSON.parse(savedContacts));
    if (savedProducts) setProducts(JSON.parse(savedProducts));
    if (savedInvoices) setInvoices(JSON.parse(savedInvoices));
    if (savedRecurring) setRecurringInvoices(JSON.parse(savedRecurring));
  }, []);

  // Sync to LocalStorage
  useEffect(() => {
    localStorage.setItem('companies', JSON.stringify(companies));
    localStorage.setItem('contacts', JSON.stringify(contacts));
    localStorage.setItem('products', JSON.stringify(products));
    localStorage.setItem('invoices', JSON.stringify(invoices));
    localStorage.setItem('recurringInvoices', JSON.stringify(recurringInvoices));
  }, [companies, contacts, products, invoices, recurringInvoices]);

  // Check Recurring Invoices
  useEffect(() => {
    if (recurringInvoices.length === 0) return;

    const today = new Date();
    const newInvoices: Invoice[] = [];
    const updatedRecurring = recurringInvoices.map(rec => {
      let lastGen = rec.lastGenerated ? parseISO(rec.lastGenerated) : parseISO(rec.startDate);
      let nextDate = lastGen;

      while (true) {
        if (rec.frequency === 'daily') nextDate = addDays(nextDate, 1);
        else if (rec.frequency === 'monthly') nextDate = addMonths(nextDate, 1);
        else if (rec.frequency === 'yearly') nextDate = addYears(nextDate, 1);

        if (isAfter(nextDate, today)) break;
        if (rec.endDate && isAfter(nextDate, parseISO(rec.endDate))) break;

        // Generate new invoice
        const company = companies.find(c => c.id === rec.companyId);
        if (company) {
          const invNo = `INV-REC-${Date.now().toString().slice(-4)}`;
          const dateStr = format(nextDate, 'yyyy-MM-dd');
          const timeStr = format(new Date(), 'HH:mm');
          
          const newInv: Invoice = {
            id: `rec-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
            companyId: rec.companyId,
            companyName: company.nameAr,
            contactId: rec.contactId,
            contactName: contacts.find(c => c.id === rec.contactId)?.name || 'Walk-in',
            invoiceNumber: invNo,
            date: dateStr,
            time: timeStr,
            items: [], // Simplified for recurring
            subtotalBefore: rec.amount / 1.15,
            discountValue: 0,
            discountType: 'fixed',
            afterDiscount: rec.amount / 1.15,
            tax: rec.amount - (rec.amount / 1.15),
            total: rec.amount,
            qrData: '', // Will be generated on view
            currency: company.currency,
            invoiceType: 'simple',
            options: {}
          };
          newInvoices.push(newInv);
        }
        lastGen = nextDate;
      }
      return { ...rec, lastGenerated: format(lastGen, 'yyyy-MM-dd') };
    });

    if (newInvoices.length > 0) {
      setInvoices(prev => [...prev, ...newInvoices]);
      setRecurringInvoices(updatedRecurring);
      Swal.fire({
        title: lang === 'ar' ? 'تم إنشاء فواتير متكررة' : 'Recurring Invoices Generated',
        text: lang === 'ar' ? `تم إنشاء ${newInvoices.length} فواتير جديدة` : `${newInvoices.length} new invoices created`,
        icon: 'success',
        toast: true,
        position: 'top-end',
        timer: 3000,
        showConfirmButton: false
      });
    }
  }, [recurringInvoices, companies, contacts, lang]);

  const exportData = () => {
    const data = { companies, contacts, products, invoices, recurringInvoices };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `proinvoice_backup_${format(new Date(), 'yyyyMMdd_HHmm')}.json`;
    a.click();
  };

  const importData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        if (data.companies) setCompanies(data.companies);
        if (data.contacts) setContacts(data.contacts);
        if (data.products) setProducts(data.products);
        if (data.invoices) setInvoices(data.invoices);
        if (data.recurringInvoices) setRecurringInvoices(data.recurringInvoices);
        Swal.fire('Success', 'Data imported successfully', 'success');
      } catch (err) {
        Swal.fire('Error', 'Invalid backup file', 'error');
      }
    };
    reader.readAsText(file);
  };

  const t = (key: string) => {
    const translations: any = {
      en: {
        dashboard: 'Dashboard', companies: 'Companies', contacts: 'Contacts', products: 'Products',
        invoices: 'Invoices', reports: 'Reports', settings: 'Settings', createInvoice: 'Create Invoice',
        totalRevenue: 'Total Revenue', activeInvoices: 'Active Invoices', totalCustomers: 'Total Customers',
        recentInvoices: 'Recent Invoices', newCompany: 'New Company', newContact: 'New Contact',
        newProduct: 'New Product', save: 'Save', cancel: 'Cancel', edit: 'Edit', delete: 'Delete',
        vatNumber: 'VAT Number', address: 'Address', phone: 'Phone', email: 'Email', sku: 'SKU',
        price: 'Price', tax: 'Tax', unit: 'Unit', invoiceNo: 'Invoice No.', date: 'Date',
        customer: 'Customer', amount: 'Amount', status: 'Status', preview: 'Preview',
        download: 'Download', subtotal: 'Subtotal', grandTotal: 'Grand Total', items: 'Items',
        qty: 'Qty', total: 'Total', addItem: 'Add Item', saveInvoice: 'Save Invoice',
        recurring: 'Recurring', backup: 'Backup', export: 'Export', import: 'Import',
        type: 'Type', simple: 'Simple', complex: 'Complex', discount: 'Discount',
        fixed: 'Fixed', percentage: 'Percentage', poNumber: 'PO Number', dueDate: 'Due Date',
        purchaseDate: 'Purchase Date', deliveryDate: 'Delivery Date', period: 'Period',
        reference: 'Reference', signature: 'Signature', clear: 'Clear', saveSignature: 'Save Signature',
        frequency: 'Frequency', daily: 'Daily', monthly: 'Monthly', yearly: 'Yearly',
        startDate: 'Start Date', endDate: 'End Date', topCustomers: 'Top Customers',
        topProducts: 'Top Products', monthlyTax: 'Monthly Tax', search: 'Search',
        reset: 'Reset', print: 'Print', exportPDF: 'Export PDF', exportHTML: 'Export HTML'
      },
      ar: {
        dashboard: 'لوحة التحكم', companies: 'الشركات', contacts: 'العملاء', products: 'المنتجات',
        invoices: 'الفواتير', reports: 'التقارير', settings: 'الإعدادات', createInvoice: 'إنشاء فاتورة',
        totalRevenue: 'إجمالي الإيرادات', activeInvoices: 'الفواتير النشطة', totalCustomers: 'إجمالي العملاء',
        recentInvoices: 'أحدث الفواتير', newCompany: 'شركة جديدة', newContact: 'عميل جديد',
        newProduct: 'منتج جديد', save: 'حفظ', cancel: 'إلغاء', edit: 'تعديل', delete: 'حذف',
        vatNumber: 'الرقم الضريبي', address: 'العنوان', phone: 'الهاتف', email: 'البريد الإلكتروني', sku: 'رمز المنتج',
        price: 'السعر', tax: 'الضريبة', unit: 'الوحدة', invoiceNo: 'رقم الفاتورة', date: 'التاريخ',
        customer: 'العميل', amount: 'المبلغ', status: 'الحالة', preview: 'معاينة',
        download: 'تحميل', subtotal: 'المجموع الفرعي', grandTotal: 'الإجمالي النهائي', items: 'الأصناف',
        qty: 'الكمية', total: 'الإجمالي', addItem: 'إضافة صنف', saveInvoice: 'حفظ الفاتورة',
        recurring: 'الفواتير المتكررة', backup: 'نسخ احتياطي', export: 'تصدير', import: 'استيراد',
        type: 'النوع', simple: 'بسيطة', complex: 'معقدة', discount: 'الخصم',
        fixed: 'قيمة ثابتة', percentage: 'نسبة مئوية', poNumber: 'رقم أمر الشراء', dueDate: 'تاريخ الاستحقاق',
        purchaseDate: 'تاريخ الشراء', deliveryDate: 'تاريخ التسليم', period: 'فترة الفاتورة',
        reference: 'رقم المرجع', signature: 'التوقيع', clear: 'مسح', saveSignature: 'حفظ التوقيع',
        frequency: 'التكرار', daily: 'يومي', monthly: 'شهري', yearly: 'سنوي',
        startDate: 'تاريخ البدء', endDate: 'تاريخ الانتهاء', topCustomers: 'أفضل العملاء',
        topProducts: 'أكثر المنتجات مبيعاً', monthlyTax: 'الضريبة الشهرية', search: 'بحث',
        reset: 'إعادة تعيين', print: 'طباعة', exportPDF: 'تصدير PDF', exportHTML: 'تصدير HTML'
      }
    };
    return translations[lang][key] || key;
  };

  return (
    <div className={cn("flex min-h-screen", lang === 'ar' ? "flex-row-reverse" : "flex-row")}>
      <aside className="no-print w-72 bg-white dark:bg-slate-900 border-r border-slate-100 dark:border-slate-800 p-6 flex flex-col sticky top-0 h-screen">
        <div className="flex items-center gap-3 mb-10">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white"><FileText /></div>
          <div className="flex flex-col">
            <h1 className="text-xl font-black tracking-tighter dark:text-white leading-none">EMAN<span className="text-indigo-600">INVOICINGSYSTEM</span></h1>
            <p className="text-[10px] text-slate-400 font-bold mt-1">ايمان للفوترة الالكترونية</p>
          </div>
        </div>
        <nav className="space-y-1 flex-1">
          <SidebarItem icon={LayoutDashboard} label={t('dashboard')} active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} />
          <SidebarItem icon={Building2} label={t('companies')} active={activeTab === 'companies'} onClick={() => setActiveTab('companies')} />
          <SidebarItem icon={Users} label={t('contacts')} active={activeTab === 'contacts'} onClick={() => setActiveTab('contacts')} />
          <SidebarItem icon={Package} label={t('products')} active={activeTab === 'products'} onClick={() => setActiveTab('products')} />
          <SidebarItem icon={FileText} label={t('invoices')} active={activeTab === 'invoices'} onClick={() => setActiveTab('invoices')} />
          <SidebarItem icon={RefreshCw} label={t('recurring')} active={activeTab === 'recurring'} onClick={() => setActiveTab('recurring')} />
          <SidebarItem icon={BarChart3} label={t('reports')} active={activeTab === 'reports'} onClick={() => setActiveTab('reports')} />
        </nav>
        <div className="pt-6 border-t border-slate-50 dark:border-slate-800 space-y-2">
          <button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')} className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
            {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
            <span className="text-sm font-medium">{theme === 'light' ? 'Dark Mode' : 'Light Mode'}</span>
          </button>
          <button onClick={() => setLang(lang === 'ar' ? 'en' : 'ar')} className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
            <Languages className="w-5 h-5" />
            <span className="text-sm font-medium">{lang === 'ar' ? 'English' : 'العربية'}</span>
          </button>
          <button 
            onClick={() => {
              Swal.fire({
                title: lang === 'ar' ? 'تحميل التطبيق' : 'Download App',
                html: lang === 'ar' 
                  ? '<div class="text-right space-y-2"><p>لتثبيت التطبيق على جهازك:</p><ol class="list-decimal list-inside"><li>انقر على أيقونة "تثبيت" في شريط العنوان بالمتصفح</li><li>أو افتح قائمة المتصفح واختر "تثبيت التطبيق"</li></ol></div>'
                  : '<div class="text-left space-y-2"><p>To install the app on your desktop:</p><ol class="list-decimal list-inside"><li>Click the "Install" icon in your browser address bar</li><li>Or open the browser menu and select "Install App"</li></ol></div>',
                icon: 'info',
                confirmButtonText: lang === 'ar' ? 'حسناً' : 'Got it',
                confirmButtonColor: '#0066cc'
              });
            }} 
            className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            <Download className="w-5 h-5" />
            <span className="text-sm font-medium">{lang === 'ar' ? 'تحميل التطبيق' : 'Download App'}</span>
          </button>
        </div>
      </aside>
      <main className="flex-1 flex flex-col min-w-0 bg-slate-50 dark:bg-slate-950">
        <header className="no-print h-20 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 px-8 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 capitalize">{t(activeTab)}</h2>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center bg-slate-50 dark:bg-slate-800 rounded-xl p-1">
              <button onClick={exportData} className="flex items-center gap-2 px-4 py-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-700 hover:shadow-sm transition-all text-sm font-medium">
                <Download className="w-4 h-4" /> {t('export')}
              </button>
              <label className="flex items-center gap-2 px-4 py-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-700 hover:shadow-sm transition-all text-sm font-medium cursor-pointer">
                <Upload className="w-4 h-4" /> {t('import')}
                <input type="file" className="hidden" accept=".json" onChange={importData} />
              </label>
            </div>
            <Button icon={Plus} size="sm" onClick={() => setActiveTab('create-invoice')}>{t('createInvoice')}</Button>
          </div>
        </header>
        <div className="p-8 overflow-y-auto flex-1">
          <AnimatePresence mode="wait">
            <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              {activeTab === 'dashboard' && <Dashboard invoices={invoices} contacts={contacts} products={products} t={t} theme={theme} />}
              {activeTab === 'companies' && <Companies companies={companies} setCompanies={setCompanies} t={t} />}
              {activeTab === 'contacts' && <Contacts contacts={contacts} setContacts={setContacts} companies={companies} t={t} />}
              {activeTab === 'products' && <Products products={products} setProducts={setProducts} t={t} />}
              {activeTab === 'invoices' && <Invoices invoices={invoices} setInvoices={setInvoices} setActiveTab={setActiveTab} t={t} companies={companies} contacts={contacts} setSelectedInvoice={setSelectedInvoice} />}
              {activeTab === 'recurring' && <Recurring recurringInvoices={recurringInvoices} setRecurringInvoices={setRecurringInvoices} companies={companies} contacts={contacts} t={t} />}
              {activeTab === 'reports' && <Reports invoices={invoices} t={t} theme={theme} />}
              {activeTab === 'create-invoice' && <InvoiceBuilder companies={companies} contacts={contacts} invoices={invoices} setInvoices={setInvoices} setActiveTab={setActiveTab} lang={lang} t={t} />}
              {activeTab === 'view-invoice' && selectedInvoice && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between no-print">
                    <Button variant="ghost" icon={ArrowLeft} onClick={() => setActiveTab('invoices')}>Back to Invoices</Button>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" icon={Printer} onClick={() => window.print()}>{t('print')}</Button>
                      <Button variant="outline" size="sm" icon={FileDown} onClick={() => {
                        const element = document.getElementById('invoice-template');
                        if (element) {
                          const opt = {
                            margin: 10,
                            filename: `${selectedInvoice.invoiceNumber}.pdf`,
                            image: { type: 'jpeg' as const, quality: 0.98 },
                            html2canvas: { scale: 2, useCORS: true },
                            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' as const }
                          };
                          html2pdf().set(opt).from(element).save();
                        }
                      }}>PDF</Button>
                    </div>
                  </div>
                  <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-xl border border-slate-100 dark:border-slate-800 overflow-x-auto">
                    <InvoiceTemplate 
                      invoice={selectedInvoice} 
                      company={companies.find(c => c.id === selectedInvoice.companyId)}
                      contact={contacts.find(c => c.id === selectedInvoice.contactId)}
                      lang={lang}
                    />
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
