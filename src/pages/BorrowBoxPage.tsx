import React, { useState, useEffect, useRef } from 'react';
import { 
  Package, 
  Search, 
  MapPin, 
  CheckCircle2, 
  AlertCircle, 
  Cpu, 
  Dumbbell, 
  Video, 
  Calculator, 
  Plus, 
  X, 
  RotateCcw, 
  Check, 
  Sparkles,
  IdCard,
  UserCheck,
  Phone,
  Mail,
  User,
  Info,
  Camera,
  Upload,
  ShieldCheck,
  Maximize2
} from 'lucide-react';
import { ItemCategory, BorrowItem } from '../types/campus';
import { 
  getStoredBorrowItems, 
  checkoutBorrowItem, 
  returnBorrowItem, 
  addNewBorrowItem, 
  resetStoredBorrowItems 
} from '../utils/borrowStore';
import { getSamplePhotoForCategory } from '../utils/samplePhotos';

interface ToastState {
  visible: boolean;
  message: string;
  type: 'success' | 'info';
}

export const BorrowBoxPage: React.FC = () => {
  const [items, setItems] = useState<BorrowItem[]>(getStoredBorrowItems);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [toast, setToast] = useState<ToastState>({ visible: false, message: '', type: 'success' });
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [activeContactItem, setActiveContactItem] = useState<BorrowItem | null>(null);

  // Photo Verification Checkout Modal State
  const [checkoutItemTarget, setCheckoutItemTarget] = useState<BorrowItem | null>(null);
  const [proofImagePreview, setProofImagePreview] = useState<string>('');
  const [borrowerName, setBorrowerName] = useState<string>('Sarang P');
  const [borrowerId, setBorrowerId] = useState<string>('21CS042');
  const [conditionChecked, setConditionChecked] = useState<boolean>(true);
  const [conditionNotes, setConditionNotes] = useState<string>('Verified working condition, all cables and accessories intact.');
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Lightbox Modal for Viewing Photo Proof
  const [viewingProofItem, setViewingProofItem] = useState<BorrowItem | null>(null);

  // New Item Registration Form State
  const [activeFormTab, setActiveFormTab] = useState<'item_info' | 'contact_details'>('item_info');
  const [newItemName, setNewItemName] = useState('');
  const [newItemCategory, setNewItemCategory] = useState<ItemCategory>('Electronics');
  const [newItemLocation, setNewItemLocation] = useState('');
  const [newItemQuantity, setNewItemQuantity] = useState<number>(2);
  const [newItemDuration, setNewItemDuration] = useState('3 Days');
  const [newItemDescription, setNewItemDescription] = useState('');
  const [newItemSpecs, setNewItemSpecs] = useState('');

  // Contact Details Form State
  const [newItemContactPerson, setNewItemContactPerson] = useState('');
  const [newItemContactPhone, setNewItemContactPhone] = useState('');
  const [newItemContactEmail, setNewItemContactEmail] = useState('');

  // Synchronize across components
  useEffect(() => {
    const handleUpdate = () => {
      setItems(getStoredBorrowItems());
    };
    window.addEventListener('campushub_borrow_updated', handleUpdate);
    return () => window.removeEventListener('campushub_borrow_updated', handleUpdate);
  }, []);

  const categories = [
    'All',
    'My Borrows',
    'Electronics',
    'Lab Gear',
    'Calculators',
    'Sports',
    'Media & AV',
  ];

  const myBorrowsCount = items.filter(i => i.borrowedByMe).length;

  const filteredItems = items.filter((item) => {
    let matchesCategory = true;
    if (selectedCategory === 'My Borrows') {
      matchesCategory = !!item.borrowedByMe;
    } else if (selectedCategory !== 'All') {
      matchesCategory = item.category === selectedCategory;
    }

    const matchesSearch = 
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.contactPerson && item.contactPerson.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  // Open Checkout Modal
  const handleOpenCheckoutModal = (item: BorrowItem) => {
    setCheckoutItemTarget(item);
    setProofImagePreview(getSamplePhotoForCategory(item.category));
    setConditionChecked(true);
    setConditionNotes('Verified working condition at handover counter.');
  };

  // Handle file upload from disk or phone camera
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploading(true);
      const reader = new FileReader();
      reader.onloadend = () => {
        setProofImagePreview(reader.result as string);
        setIsUploading(false);
      };
      reader.readAsDataURL(file);
    }
  };

  // Confirm Verified Checkout
  const handleConfirmVerifiedCheckout = (e: React.FormEvent) => {
    e.preventDefault();
    if (!checkoutItemTarget) return;

    const res = checkoutBorrowItem(checkoutItemTarget.id, {
      photoUrl: proofImagePreview,
      borrowerName: borrowerName.trim() || 'Sarang P',
      borrowerId: borrowerId.trim() || '21CS042',
      conditionNotes: conditionNotes.trim(),
    });

    if (res.success) {
      setItems(getStoredBorrowItems());
      setCheckoutItemTarget(null);
      setToast({ visible: true, message: res.message, type: 'success' });
      setTimeout(() => setToast(prev => ({ ...prev, visible: false })), 5000);
    }
  };

  const handleReturn = (itemId: string) => {
    const res = returnBorrowItem(itemId);
    if (res.success) {
      setItems(getStoredBorrowItems());
      setToast({ visible: true, message: res.message, type: 'info' });
      setTimeout(() => setToast(prev => ({ ...prev, visible: false })), 5000);
    }
  };

  const handleCreateItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim() || !newItemLocation.trim()) return;

    addNewBorrowItem({
      name: newItemName.trim(),
      category: newItemCategory,
      location: newItemLocation.trim(),
      totalQuantity: Number(newItemQuantity) || 1,
      availableQuantity: Number(newItemQuantity) || 1,
      maxDuration: newItemDuration,
      description: newItemDescription.trim() || 'Available for department student use.',
      specs: newItemSpecs.trim() || undefined,
      contactPerson: newItemContactPerson.trim() || 'Lab Coordinator Desk',
      contactPhone: newItemContactPhone.trim() || '+91 98450 12345',
      contactEmail: newItemContactEmail.trim() || 'counter@campushub.edu',
    });

    setItems(getStoredBorrowItems());
    setIsModalOpen(false);

    // Reset Form
    setNewItemName('');
    setNewItemLocation('');
    setNewItemDescription('');
    setNewItemSpecs('');
    setNewItemContactPerson('');
    setNewItemContactPhone('');
    setNewItemContactEmail('');
    setActiveFormTab('item_info');

    setToast({
      visible: true,
      message: `Added "${newItemName}" with contact details to campus inventory catalog!`,
      type: 'success',
    });
    setTimeout(() => setToast(prev => ({ ...prev, visible: false })), 5000);
  };

  const handleReset = () => {
    const defaults = resetStoredBorrowItems();
    setItems(defaults);
    setToast({ visible: false, message: '', type: 'info' });
  };

  const getCategoryIcon = (category: string) => {
    const className = "w-4 h-4";
    switch (category) {
      case 'Electronics':
        return <Cpu className={className} />;
      case 'Lab Gear':
        return <Package className={className} />;
      case 'Calculators':
        return <Calculator className={className} />;
      case 'Sports':
        return <Dumbbell className={className} />;
      case 'Media & AV':
        return <Video className={className} />;
      default:
        return <Package className={className} />;
    }
  };

  return (
    <div className="space-y-8 animate-in relative">
      
      {/* Toast Notification */}
      {toast.visible && (
        <div className="fixed top-20 right-4 sm:right-8 z-50 max-w-md w-full animate-in shadow-2xl rounded-2xl bg-slate-900 text-white p-4 border border-slate-700 flex items-start gap-3.5">
          <div className="w-8 h-8 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-teal-400 uppercase tracking-wider">
                {toast.type === 'success' ? 'Photo Handover Verified' : 'Inventory Returned'}
              </span>
              <button
                onClick={() => setToast(prev => ({ ...prev, visible: false }))}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-slate-200 mt-1 leading-snug font-medium">
              {toast.message}
            </p>
          </div>
        </div>
      )}

      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-200/80 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 text-teal-700 text-xs font-semibold mb-2 border border-teal-100">
            <Package className="w-3.5 h-3.5" />
            <span>Campus Hardware & Equipment Inventory</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-sans">
            BorrowBox
          </h1>
          <p className="text-sm text-slate-500 mt-1 max-w-2xl">
            Browse lab sensors, graphing calculators, and sports sets. Checkouts require <strong>Physical Photo Handover Proof</strong> to prevent false bookings.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          
          {/* Search Input */}
          <div className="relative w-full sm:w-60">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search items, contacts, desks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-white border border-slate-200 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 shadow-2xs"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                Clear
              </button>
            )}
          </div>

          {/* Add Item Button */}
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs sm:text-sm shadow-sm shadow-teal-200 transition-all cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>+ List Equipment</span>
          </button>

          {/* Reset button */}
          {(items.length !== 8 || myBorrowsCount > 0) && (
            <button
              onClick={handleReset}
              title="Reset inventory back to defaults"
              className="p-2.5 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          )}

        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
        {categories.map((cat) => {
          const isActive = selectedCategory === cat;
          let count = 0;
          if (cat === 'All') count = items.length;
          else if (cat === 'My Borrows') count = myBorrowsCount;
          else count = items.filter(i => i.category === cat).length;

          return (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-2 ${
                isActive
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              } ${cat === 'My Borrows' && myBorrowsCount > 0 ? 'ring-2 ring-indigo-300 text-indigo-700' : ''}`}
            >
              <span>{cat}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                  isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Items Grid */}
      {filteredItems.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredItems.map((item) => {
            const isAvailable = item.availability === 'Available';
            const isBorrowedByMe = !!item.borrowedByMe;

            return (
              <div
                key={item.id}
                className={`rounded-3xl bg-white p-5 border shadow-xs hover:shadow-md transition-all flex flex-col justify-between group ${
                  isBorrowedByMe
                    ? 'border-indigo-400 ring-2 ring-indigo-100 bg-indigo-50/15'
                    : 'border-slate-200'
                }`}
              >
                <div>
                  {/* Top Bar: Category and Availability Badge */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700">
                      {getCategoryIcon(item.category)}
                      <span>{item.category}</span>
                    </span>

                    {isBorrowedByMe ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                        <UserCheck className="w-3.5 h-3.5 text-indigo-600" />
                        <span>Borrowed by You</span>
                      </span>
                    ) : (
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                          isAvailable
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-rose-50 text-rose-700 border-rose-200'
                        }`}
                      >
                        {isAvailable ? (
                          <>
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>Available ({item.availableQuantity})</span>
                          </>
                        ) : (
                          <>
                            <AlertCircle className="w-3 h-3 text-rose-600" />
                            <span>Borrowed</span>
                          </>
                        )}
                      </span>
                    )}
                  </div>

                  {/* Title */}
                  <h3 className="text-sm sm:text-base font-bold text-slate-900 group-hover:text-teal-700 transition-colors leading-snug mb-2">
                    {item.name}
                  </h3>

                  {/* Description */}
                  <p className="text-xs text-slate-500 line-clamp-2 mb-3 leading-relaxed">
                    {item.description}
                  </p>

                  {/* Specs or Note */}
                  {item.specs && (
                    <div className="text-[11px] bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-slate-600 mb-3 font-medium">
                      {item.specs}
                    </div>
                  )}

                  {/* Photo Proof Thumbnail Box if currently borrowed with photo proof */}
                  {isBorrowedByMe && item.proofPhotoUrl && (
                    <div 
                      onClick={() => setViewingProofItem(item)}
                      className="mb-3 rounded-2xl border border-indigo-200 bg-white p-2 flex items-center gap-3 cursor-pointer hover:border-indigo-400 transition-all group/proof shadow-2xs"
                    >
                      <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-slate-100 shrink-0">
                        <img 
                          src={item.proofPhotoUrl} 
                          alt="Handover proof" 
                          className="w-full h-full object-cover group-hover/proof:scale-105 transition-transform" 
                        />
                        <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover/proof:opacity-100 transition-opacity text-white">
                          <Maximize2 className="w-4 h-4" />
                        </div>
                      </div>
                      <div className="min-w-0">
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded">
                          <Camera className="w-3 h-3" />
                          Handover Photo Proof
                        </span>
                        <div className="text-[11px] font-semibold text-slate-700 truncate mt-0.5">
                          {item.borrowerName} ({item.borrowerId})
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {item.borrowedAt}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Contact Detail Pill on Card */}
                  {item.contactPerson && (
                    <div className="mb-3 p-2.5 rounded-xl bg-teal-50/60 border border-teal-100 flex items-center justify-between text-xs">
                      <div className="min-w-0 flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                        <span className="text-[11px] font-semibold text-teal-900 truncate">
                          {item.contactPerson}
                        </span>
                      </div>
                      <button
                        onClick={() => setActiveContactItem(item)}
                        className="text-[11px] font-bold text-teal-700 hover:text-teal-900 underline shrink-0 cursor-pointer"
                      >
                        Details
                      </button>
                    </div>
                  )}

                  {/* Due Date Indicator if borrowed by user */}
                  {isBorrowedByMe && item.dueDate && (
                    <div className="text-[11px] bg-indigo-50 p-2 rounded-xl border border-indigo-200 text-indigo-800 mb-3 font-semibold flex items-center gap-1.5">
                      <IdCard className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                      <span>{item.dueDate} (ID: 21CS042)</span>
                    </div>
                  )}
                </div>

                {/* Bottom Details & Photo Verified Checkout Action */}
                <div className="pt-3 border-t border-slate-100 space-y-3">
                  <div className="space-y-1 text-xs text-slate-600">
                    <div className="flex items-start gap-2">
                      <MapPin className="w-3.5 h-3.5 text-teal-600 shrink-0 mt-0.5" />
                      <span className="text-[11px] leading-snug font-medium text-slate-700">
                        {item.location}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-400 pt-0.5">
                      <span>Duration:</span>
                      <span className="font-semibold text-slate-700 font-mono">
                        {item.maxDuration}
                      </span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2">
                    {isBorrowedByMe ? (
                      <button
                        onClick={() => handleReturn(item.id)}
                        className="w-full py-2 px-3 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-2xs"
                      >
                        <span>Return Item to Counter</span>
                      </button>
                    ) : isAvailable ? (
                      <button
                        onClick={() => handleOpenCheckoutModal(item)}
                        className="w-full py-2 px-3 rounded-xl text-xs font-bold bg-teal-600 hover:bg-teal-700 text-white flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-2xs group-hover:shadow-sm"
                      >
                        <Camera className="w-3.5 h-3.5" />
                        <span>Photo Verified Checkout</span>
                      </button>
                    ) : (
                      <button
                        disabled
                        className="w-full py-2 px-3 rounded-xl text-xs font-semibold bg-slate-100 text-slate-400 cursor-not-allowed text-center"
                      >
                        Currently Unavailable
                      </button>
                    )}

                    {/* Quick Contact Desk Button */}
                    <button
                      onClick={() => setActiveContactItem(item)}
                      title="View In-Charge Contact Details"
                      className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors shrink-0 cursor-pointer"
                    >
                      <Phone className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="rounded-3xl bg-white p-12 border border-slate-200 text-center space-y-3">
          <Package className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">No items found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            No equipment matches "{searchQuery}" under "{selectedCategory}".
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('All');
            }}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
          >
            Reset Filters
          </button>
        </div>
      )}

      {/* Trust & Verification Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-slate-900 to-indigo-950 text-white p-6 sm:p-7 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-teal-300 text-xs font-bold uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4" />
            <span>Anti-Fraud Physical Handover Verification</span>
          </div>
          <p className="text-sm font-semibold text-slate-200">
            Checkouts require a physical handover photo at the issue counter. This prevents false bookings and documents physical equipment condition.
          </p>
        </div>
        <div className="shrink-0 text-xs font-semibold text-white bg-teal-600/30 border border-teal-400/30 px-4 py-2 rounded-xl">
          Photo Stamped • Zero Fraud
        </div>
      </div>

      {/* ========================================================= */}
      {/* MODAL 1: PHOTO VERIFICATION CHECKOUT MODAL */}
      {/* ========================================================= */}
      {checkoutItemTarget && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in">
          <div className="rounded-3xl bg-white p-6 sm:p-7 max-w-lg w-full shadow-2xl border border-slate-200 space-y-5 max-h-[90vh] overflow-y-auto">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
                  <Camera className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Physical Handover Verification
                  </h3>
                  <p className="text-xs text-slate-500">
                    Step 1 of 1 • Photo Proof Checkout
                  </p>
                </div>
              </div>
              <button
                onClick={() => setCheckoutItemTarget(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmVerifiedCheckout} className="space-y-4">
              
              {/* Target Item summary banner */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Item To Borrow</span>
                  <span className="font-bold text-slate-900 text-sm">{checkoutItemTarget.name}</span>
                  <span className="text-slate-500 block mt-0.5">Location: {checkoutItemTarget.location}</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Max Duration</span>
                  <span className="font-mono font-bold text-indigo-600">{checkoutItemTarget.maxDuration}</span>
                </div>
              </div>

              {/* Student Identity Verification */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Student Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={borrowerName}
                    onChange={(e) => setBorrowerName(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm font-semibold text-slate-900 bg-slate-50"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Roll No / ID
                  </label>
                  <input
                    type="text"
                    required
                    value={borrowerId}
                    onChange={(e) => setBorrowerId(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm font-mono font-bold text-indigo-700 bg-slate-50"
                  />
                </div>
              </div>

              {/* PHOTO PROOF CAPTURE & UPLOAD ZONE */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700 uppercase flex items-center gap-1.5">
                    <Camera className="w-3.5 h-3.5 text-teal-600" />
                    <span>Upload Handover Photo Proof *</span>
                  </label>
                  <span className="text-[11px] text-slate-400">Proves item handover</span>
                </div>

                {/* Upload or Sample Selector */}
                <div className="border-2 border-dashed border-slate-200 hover:border-teal-400 rounded-2xl p-4 bg-slate-50/50 transition-colors text-center space-y-3">
                  
                  {proofImagePreview ? (
                    <div className="relative rounded-xl overflow-hidden max-h-48 w-full bg-slate-900 group">
                      <img
                        src={proofImagePreview}
                        alt="Proof preview"
                        className="w-full h-44 object-cover opacity-90"
                      />
                      {/* Live Security Stamp Watermark */}
                      <div className="absolute bottom-2 left-2 right-2 bg-black/70 backdrop-blur-md rounded-lg p-1.5 text-left text-[10px] font-mono text-emerald-300 flex items-center justify-between border border-white/10">
                        <span>✓ HANDOVER VERIFIED • {checkoutItemTarget.location}</span>
                        <span>SEP 11</span>
                      </div>
                      
                      <button
                        type="button"
                        onClick={() => setProofImagePreview('')}
                        className="absolute top-2 right-2 bg-black/60 hover:bg-black text-white p-1 rounded-full opacity-80 hover:opacity-100"
                        title="Remove photo"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="py-4 space-y-2">
                      <Upload className="w-8 h-8 text-slate-400 mx-auto" />
                      <p className="text-xs font-semibold text-slate-700">
                        Upload or snap a photo of the item at the counter
                      </p>
                      <p className="text-[11px] text-slate-400">
                        Supports camera photos or uploaded images from your device
                      </p>
                    </div>
                  )}

                  {/* Actions to pick file or use sample */}
                  <div className="flex items-center justify-center gap-2 pt-1">
                    <input
                      type="file"
                      ref={fileInputRef}
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-xs font-bold text-slate-700 flex items-center gap-1.5 cursor-pointer shadow-2xs"
                    >
                      <Upload className="w-3.5 h-3.5 text-teal-600" />
                      <span>{proofImagePreview ? 'Change Photo' : 'Upload from Device'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setProofImagePreview(getSamplePhotoForCategory(checkoutItemTarget.category))}
                      className="px-3 py-1.5 rounded-xl bg-teal-50 hover:bg-teal-100 border border-teal-200 text-xs font-bold text-teal-800 flex items-center gap-1.5 cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-teal-600" />
                      <span>⚡ Use Desk Cam Sample</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Handover Condition Checklist */}
              <div className="p-3 rounded-2xl bg-emerald-50/50 border border-emerald-100 space-y-2 text-xs">
                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    required
                    checked={conditionChecked}
                    onChange={(e) => setConditionChecked(e.target.checked)}
                    className="mt-0.5 accent-teal-600 w-4 h-4 rounded"
                  />
                  <span className="font-semibold text-emerald-950 text-xs leading-snug">
                    I verify that I have physically received this equipment at {checkoutItemTarget.location} in working condition and agree to return it within {checkoutItemTarget.maxDuration}.
                  </span>
                </label>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setCheckoutItemTarget(null)}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!proofImagePreview || !conditionChecked}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold bg-teal-600 hover:bg-teal-700 text-white shadow-sm shadow-teal-200 flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Confirm Verified Checkout</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 2: LIGHTBOX FOR VIEWING VERIFIED HANDOVER PHOTO */}
      {/* ========================================================= */}
      {viewingProofItem && (
        <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4 animate-in">
          <div className="rounded-3xl bg-white p-6 max-w-md w-full shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <div>
                <span className="text-[10px] uppercase font-bold text-emerald-600 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  Verified Handover Photo Proof
                </span>
                <h3 className="text-base font-bold text-slate-900 mt-0.5">
                  {viewingProofItem.name}
                </h3>
              </div>
              <button
                onClick={() => setViewingProofItem(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {viewingProofItem.proofPhotoUrl && (
              <div className="relative rounded-2xl overflow-hidden bg-slate-900 border border-slate-200">
                <img
                  src={viewingProofItem.proofPhotoUrl}
                  alt="Full proof"
                  className="w-full h-56 object-cover"
                />
                <div className="absolute bottom-2 left-2 right-2 bg-black/75 backdrop-blur-md rounded-xl p-2 text-white text-[11px] font-mono flex items-center justify-between">
                  <span>📍 {viewingProofItem.location}</span>
                  <span className="text-emerald-300">✓ VERIFIED</span>
                </div>
              </div>
            )}

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-400">Borrower:</span>
                <span className="font-bold text-slate-800">{viewingProofItem.borrowerName} ({viewingProofItem.borrowerId})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Handover Time:</span>
                <span className="font-mono text-slate-700">{viewingProofItem.borrowedAt}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Return Due:</span>
                <span className="font-mono font-bold text-indigo-600">{viewingProofItem.dueDate}</span>
              </div>
              <div className="pt-1 border-t border-slate-200/60 text-slate-500 text-[11px]">
                Condition: {viewingProofItem.conditionNotes || 'Working order confirmed.'}
              </div>
            </div>

            <button
              onClick={() => setViewingProofItem(null)}
              className="w-full py-2.5 rounded-xl font-bold text-xs bg-slate-900 hover:bg-slate-800 text-white transition-colors cursor-pointer"
            >
              Close Proof
            </button>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 3: CONTACT DETAILS POPUP */}
      {/* ========================================================= */}
      {activeContactItem && (
        <div className="fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in">
          <div className="rounded-3xl bg-white p-6 sm:p-7 max-w-md w-full shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
                  <Phone className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Desk In-Charge Contact
                  </h3>
                  <p className="text-xs text-slate-500 truncate max-w-[240px]">
                    {activeContactItem.name}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setActiveContactItem(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 pt-1">
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2.5">
                <div className="flex items-center gap-2.5">
                  <User className="w-4 h-4 text-teal-600 shrink-0" />
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Coordinator / Tech In-Charge</span>
                    <span className="text-sm font-bold text-slate-900">
                      {activeContactItem.contactPerson || 'Campus Lab Attendant'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 pt-2 border-t border-slate-200/60">
                  <Phone className="w-4 h-4 text-teal-600 shrink-0" />
                  <div className="flex-1">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Phone / WhatsApp</span>
                    <a
                      href={`tel:${activeContactItem.contactPhone || '+919845012345'}`}
                      className="text-sm font-bold text-indigo-600 hover:underline font-mono"
                    >
                      {activeContactItem.contactPhone || '+91 98450 12345'}
                    </a>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Call Desk
                  </span>
                </div>

                <div className="flex items-center gap-2.5 pt-2 border-t border-slate-200/60">
                  <Mail className="w-4 h-4 text-teal-600 shrink-0" />
                  <div className="flex-1">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Official Department Email</span>
                    <a
                      href={`mailto:${activeContactItem.contactEmail || 'desk@campushub.edu'}`}
                      className="text-xs font-bold text-indigo-600 hover:underline"
                    >
                      {activeContactItem.contactEmail || 'desk@campushub.edu'}
                    </a>
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-teal-50/50 border border-teal-100 text-xs text-slate-600 space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-teal-900">
                  <MapPin className="w-3.5 h-3.5 text-teal-600" />
                  <span>{activeContactItem.location}</span>
                </div>
                <p className="text-[11px] text-slate-500">
                  Issue Timings: Monday to Friday, 9:30 AM – 5:00 PM. Please bring your physical College ID Card.
                </p>
              </div>
            </div>

            <button
              onClick={() => setActiveContactItem(null)}
              className="w-full py-2.5 rounded-xl font-bold text-xs bg-slate-900 hover:bg-slate-800 text-white transition-colors cursor-pointer"
            >
              Close Contact Card
            </button>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 4: LIST NEW CAMPUS EQUIPMENT (WITH CONTACT DETAILS TAB) */}
      {/* ========================================================= */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="rounded-3xl bg-white p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-slate-200 animate-in space-y-5">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  New Equipment Registration
                </h3>
                <p className="text-xs text-slate-500">
                  Publish hardware, kits, or sports gear to the student catalog
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* TAB SELECTOR: Item Details vs Contact Details */}
            <div className="flex rounded-xl bg-slate-100 p-1 border border-slate-200/80">
              <button
                type="button"
                onClick={() => setActiveFormTab('item_info')}
                className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeFormTab === 'item_info'
                    ? 'bg-white text-teal-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                1. Equipment Info
              </button>
              <button
                type="button"
                onClick={() => setActiveFormTab('contact_details')}
                className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  activeFormTab === 'contact_details'
                    ? 'bg-white text-teal-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Phone className="w-3.5 h-3.5 text-teal-600" />
                <span>2. Contact Details Tab</span>
                {(newItemContactPerson || newItemContactPhone) && (
                  <span className="w-2 h-2 rounded-full bg-teal-500" />
                )}
              </button>
            </div>

            <form onSubmit={handleCreateItem} className="space-y-4">
              
              {/* TAB 1: EQUIPMENT INFO */}
              {activeFormTab === 'item_info' && (
                <div className="space-y-3.5 animate-in">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                      Item Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g., STM32 Nucleo-64 Development Board"
                      value={newItemName}
                      onChange={(e) => setNewItemName(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                        Category
                      </label>
                      <select
                        value={newItemCategory}
                        onChange={(e) => setNewItemCategory(e.target.value as ItemCategory)}
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 cursor-pointer"
                      >
                        <option value="Electronics">Electronics</option>
                        <option value="Lab Gear">Lab Gear</option>
                        <option value="Calculators">Calculators</option>
                        <option value="Sports">Sports</option>
                        <option value="Media & AV">Media & AV</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                        Quantity
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="50"
                        value={newItemQuantity}
                        onChange={(e) => setNewItemQuantity(Number(e.target.value))}
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                        Pickup Location *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g., Embedded Systems Lab (Rm 301)"
                        value={newItemLocation}
                        onChange={(e) => setNewItemLocation(e.target.value)}
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                        Max Duration
                      </label>
                      <select
                        value={newItemDuration}
                        onChange={(e) => setNewItemDuration(e.target.value)}
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 cursor-pointer"
                      >
                        <option value="Same Day Return">Same Day Return</option>
                        <option value="2 Days">2 Days</option>
                        <option value="3 Days">3 Days</option>
                        <option value="5 Days">5 Days</option>
                        <option value="7 Days">7 Days</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                      Description
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Short description of what the item includes..."
                      value={newItemDescription}
                      onChange={(e) => setNewItemDescription(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                      Specs / Requirements (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., ARM Cortex-M4, USB-A cable included"
                      value={newItemSpecs}
                      onChange={(e) => setNewItemSpecs(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => setActiveFormTab('contact_details')}
                    className="w-full py-2.5 px-4 rounded-xl bg-teal-50 text-teal-700 hover:bg-teal-100 border border-teal-200 text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-colors"
                  >
                    <span>Next: Add Contact Details &rarr;</span>
                  </button>
                </div>
              )}

              {/* TAB 2: CONTACT DETAILS TAB */}
              {activeFormTab === 'contact_details' && (
                <div className="space-y-4 animate-in">
                  <div className="p-3 rounded-2xl bg-teal-50/70 border border-teal-100 flex items-start gap-2.5 text-xs text-teal-800">
                    <Info className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                    <span>
                      Provide coordinator or desk in-charge contact info so students can contact the lab directly before collecting.
                    </span>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                      Contact Person / Desk In-Charge *
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        required
                        placeholder="e.g., Dr. Ramesh Sharma (Lab Lead)"
                        value={newItemContactPerson}
                        onChange={(e) => setNewItemContactPerson(e.target.value)}
                        className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                      Contact Phone / WhatsApp *
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="tel"
                        required
                        placeholder="e.g., +91 98450 12345"
                        value={newItemContactPhone}
                        onChange={(e) => setNewItemContactPhone(e.target.value)}
                        className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                      Official Department Email *
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        required
                        placeholder="e.g., embeddedlab@campushub.edu"
                        value={newItemContactEmail}
                        onChange={(e) => setNewItemContactEmail(e.target.value)}
                        className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setActiveFormTab('item_info')}
                      className="py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer transition-colors"
                    >
                      &larr; Back to Info
                    </button>
                    <div className="text-[11px] text-slate-400">
                      All fields will appear on the item card.
                    </div>
                  </div>
                </div>
              )}

              {/* Form Action Footer */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl text-xs font-bold bg-teal-600 hover:bg-teal-700 text-white shadow-sm shadow-teal-200 cursor-pointer transition-all"
                >
                  Save & Publish Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
