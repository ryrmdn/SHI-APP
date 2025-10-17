
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from './services/supabaseClient';
import type { Employee, EmployeeProblem } from './types';

// Utility Functions
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
};

const formatProblemDate = (dateString: string | null | undefined): string => {
    if (!dateString) return '-';
    try {
        const [year, month, day] = dateString.split('-');
        if (!year || !month || !day) return dateString;
        return `${day}/${month}/${year}`;
    } catch (e) {
        return dateString;
    }
};

const formatRupiah = (value: number | string): string => {
    let number_string = String(value).replace(/[^,\d]/g, '').toString();
    let split = number_string.split(',');
    let sisa = split[0].length % 3;
    let rupiah = split[0].substr(0, sisa);
    let ribuan = split[0].substr(sisa).match(/\d{3}/gi);

    if (ribuan) {
        const separator = sisa ? '.' : '';
        rupiah += separator + ribuan.join('.');
    }

    rupiah = split[1] !== undefined ? rupiah + ',' + split[1] : rupiah;
    return rupiah;
};

const parseRupiah = (value: string): number => {
    return Number(value.replace(/\./g, ''));
};


// #region --- UI Components ---

interface HeaderProps {
    appState: 'public-view' | 'admin-view' | 'user-view';
    onNavigate: (page: string) => void;
    onLogout: () => void;
}

const Header: React.FC<HeaderProps> = ({ appState, onNavigate, onLogout }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const burgerContainerRef = useRef<HTMLDivElement>(null);

    const handleNavigate = (page: string) => {
        setIsMenuOpen(false);
        onNavigate(page);
    };
    
    const handleLogoutClick = () => {
        setIsMenuOpen(false);
        onLogout();
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (burgerContainerRef.current && !burgerContainerRef.current.contains(event.target as Node)) {
                setIsMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    return (
        <header className="fixed top-0 left-0 right-0 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4 z-50 bg-gray-50/90 backdrop-blur-sm shadow-md">
            <nav className="flex items-center justify-between w-full">
                <div onClick={() => onNavigate('mainHero')} className="flex items-center space-x-2 cursor-pointer">
                    <img
                        src="https://www.shinpo.co.id/wp-content/uploads/2019/09/shinpo-logo-mobile.png"
                        alt="Logo SHINPO"
                        className="h-10 w-auto"
                    />
                </div>

                <div className="flex items-center space-x-3 sm:space-x-4">
                    {appState === 'public-view' && (
                        <div className="hidden sm:flex space-x-6 text-lg font-medium">
                            <a href="#" onClick={(e) => { e.preventDefault(); handleNavigate('mainHero'); }} className="text-gray-800 hover:text-red-500 transition duration-150">Home</a>
                            <a href="#" onClick={(e) => { e.preventDefault(); handleNavigate('aboutPage'); }} className="text-gray-800 hover:text-red-500 transition duration-150">About</a>
                            <a href="#" onClick={(e) => { e.preventDefault(); handleNavigate('contactPage'); }} className="text-gray-800 hover:text-red-500 transition duration-150">Contact</a>
                        </div>
                    )}

                    {appState === 'admin-view' && (
                        <button
                            onClick={handleLogoutClick}
                            className="bg-red-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:bg-red-700 transition duration-200 focus:outline-none"
                        >
                            Logout
                        </button>
                    )}

                    { (appState === 'public-view' || appState === 'user-view') && (
                        <div ref={burgerContainerRef} id="burgerContainer" className="relative">
                            <button
                                onClick={() => setIsMenuOpen(!isMenuOpen)}
                                className="p-2 text-blue-900 border border-blue-900 rounded-lg hover:bg-blue-100 transition duration-150"
                                aria-label="Toggle Menu"
                                aria-expanded={isMenuOpen}
                            >
                                {isMenuOpen ? (
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                                ) : (
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7"></path></svg>
                                )}
                            </button>

                            {isMenuOpen && (
                                <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-xl py-2 z-20">
                                    <a href="#" onClick={(e) => { e.preventDefault(); handleNavigate('userMenu'); }} className="block mx-2 my-1 px-3 py-2 bg-red-500 text-center text-white text-lg font-bold rounded-lg hover:bg-red-600 transition duration-300 shadow-md">
                                        Pengguna
                                    </a>
                                    <div className="border-t border-gray-200 my-1"></div>
                                    <a href="#" onClick={(e) => { e.preventDefault(); handleNavigate('adminLogin'); }} className="block mx-2 my-1 px-3 py-2 bg-red-500 text-center text-white text-lg font-bold rounded-lg hover:bg-red-600 transition duration-300 shadow-md">
                                        Admin
                                    </a>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </nav>
        </header>
    );
};

const Carousel: React.FC = () => {
    const slides = [
        {
            img: "https://i.ytimg.com/vi/FZOv0lTINTY/maxresdefault.jpg",
            title: "INOVASI PENYIMPANAN",
            subtitle: "Wadah Plastik Berkualitas Tinggi, Tahan Banting"
        },
        {
            img: "https://lh5.googleusercontent.com/p/AF1QipOF2dgy1a188H9MhQvKG10RKxOE9uhAL51TxYn2=w483-h240-k-no",
            title: "FURNITURE TAHAN LAMA",
            subtitle: "Desain Modern untuk Rumah dan Industri"
        },
        {
            img: "https://down-id.img.susercontent.com/file/id-11134207-7rasm-m2lwarhw5cqs26",
            title: "PELOPOR KUALITAS",
            subtitle: "Produk Rumah Tangga Terpercaya Sejak 1982"
        }
    ];
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentIndex((prevIndex) => (prevIndex + 1) % slides.length);
        }, 5000);
        return () => clearInterval(interval);
    }, [slides.length]);

    return (
        <div id="mainCarouselContainer" className="w-full mt-16">
            <div className="relative w-full overflow-hidden shadow-2xl pt-[56.25%]"> {/* 16:9 Aspect Ratio */}
                {slides.map((slide, index) => (
                    <div
                        key={index}
                        className={`absolute top-0 left-0 w-full h-full transition-opacity duration-1000 ease-in-out ${index === currentIndex ? 'opacity-100 z-10' : 'opacity-0'}`}
                    >
                        <img src={slide.img} alt={slide.title} className="absolute inset-0 w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black bg-opacity-30 flex flex-col items-center justify-center p-8 text-center">
                            <h2 className="text-3xl sm:text-5xl font-extrabold text-white">{slide.title}</h2>
                            <p className="text-lg sm:text-xl text-gray-200 mt-2">{slide.subtitle}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    children: React.ReactNode;
    size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children, size = 'md' }) => {
    if (!isOpen) return null;

    const sizeClasses = {
        sm: 'max-w-sm',
        md: 'max-w-md',
        lg: 'max-w-lg',
        xl: 'max-w-xl',
        '2xl': 'max-w-2xl',
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-[60]" onClick={onClose}>
            <div className={`bg-white rounded-lg shadow-xl w-full ${sizeClasses[size]} max-h-[90vh] overflow-y-auto p-6 sm:p-8 relative`} onClick={(e) => e.stopPropagation()}>
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 text-3xl leading-none">&times;</button>
                {children}
            </div>
        </div>
    );
};

const BackButton: React.FC<{ onClick: () => void }> = ({ onClick }) => (
    <div className="w-full text-left mb-6">
        <button onClick={onClick} className="p-0 bg-transparent text-blue-600 rounded-none font-semibold transition-colors hover:text-blue-800 inline-block shadow-none cursor-pointer">
            &larr; Kembali
        </button>
    </div>
);

// #endregion --- UI Components ---

// #region --- Page Components ---

const HomePage: React.FC = () => {
    return (
        <>
            <Carousel />
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="flex flex-col items-center justify-center pt-8">
                    <div className="w-full text-center mb-12 lg:mb-0">
                        <h1 className="text-xl sm:text-4xl lg:text-5xl font-extrabold leading-tight text-red-500 mb-3">
                            Solusi Plastik Terbaik untuk Kebutuhan Rumah Tangga dan Industri Anda
                        </h1>
                        <p className="text-md sm:text-lg font-medium text-blue-900 opacity-90 mb-8">
                            PT. Sahabat Intim Plasindo, Inovasi dalam Setiap Produk Plastik.
                        </p>
                    </div>
                </div>
            </main>
        </>
    );
};

interface PageWrapperProps {
  children: React.ReactNode;
  maxWidth?: 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl' | '7xl';
  showBackButton?: boolean;
  onBack?: () => void;
}

const PageWrapper: React.FC<PageWrapperProps> = ({ children, maxWidth = '5xl', showBackButton, onBack }) => (
  <div className={`page-content max-w-${maxWidth} w-full mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16 flex flex-col items-center`}>
    {showBackButton && onBack && <BackButton onClick={onBack} />}
    {children}
  </div>
);


const UserMenuPage: React.FC<{ onNavigate: (page: string) => void; onBack: () => void; }> = ({ onNavigate, onBack }) => (
    <PageWrapper maxWidth="xl" showBackButton onBack={onBack}>
        <h2 className="text-4xl font-extrabold text-blue-900 mb-6 text-center">Selamat Datang, Pengguna!</h2>
        <p className="text-lg text-gray-600 mb-10 text-center">Silakan pilih menu di bawah ini untuk mengakses layanan PT. Sahabat Intim Plasindo.</p>
        <div className="space-y-4 w-full">
            <a href="#" onClick={(e) => { e.preventDefault(); onNavigate('biodataPage'); }} className="block w-full p-3 bg-green-50 text-green-800 text-lg font-medium text-center rounded-lg shadow-md hover:bg-green-100 hover:shadow-lg transition duration-150 border border-green-200">
                Biodata Karyawan
            </a>
            <a href="#" onClick={(e) => { e.preventDefault(); onNavigate('userProblemPage'); }} className="block w-full p-3 bg-yellow-50 text-yellow-800 text-lg font-medium text-center rounded-lg shadow-md hover:bg-yellow-100 hover:shadow-lg transition duration-150 border border-yellow-200">
                Permasalahan Karyawan
            </a>
            <a href="#" onClick={(e) => { e.preventDefault(); onNavigate('userProductionPage'); }} className="block w-full p-3 bg-blue-50 text-blue-800 text-lg font-medium text-center rounded-lg shadow-md hover:bg-blue-100 hover:shadow-lg transition duration-150 border border-blue-200">
                Permasalahan Produksi
            </a>
        </div>
    </PageWrapper>
);

const AdminLoginPage: React.FC<{ onLogin: () => void; onNavigate: (page: string) => void }> = ({ onLogin, onNavigate }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        if (username === 'entrydata' && password === 'admshinpo') {
            onLogin();
        } else {
            setMessage('Username atau Password salah. Silakan coba lagi.');
        }
    };

    return (
        <PageWrapper maxWidth="xl">
            <div className="w-full max-w-md bg-white p-6 sm:p-8 rounded-xl shadow-2xl border border-gray-100">
                <h2 className="text-3xl font-bold text-red-600 mb-8 text-center">Login Admin</h2>
                <form onSubmit={handleLogin}>
                    <div className="mb-5">
                        <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">Username</label>
                        <input type="text" id="adminUsername" name="username" placeholder="Masukkan Username Anda" required value={username} onChange={(e) => setUsername(e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-red-500 focus:border-red-500 transition duration-150" />
                    </div>
                    <div className="mb-8">
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                        <input type="password" id="adminPassword" name="password" placeholder="Masukkan Password Anda" required value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-red-500 focus:border-red-500 transition duration-150" />
                    </div>
                    {message && <div className="text-center text-sm text-red-500 mb-4">{message}</div>}
                    <button type="submit" className="w-full bg-red-600 text-white font-bold py-3 rounded-lg shadow-lg hover:bg-red-700 transition duration-200 focus:outline-none focus:ring-4 focus:ring-red-300">
                        Login
                    </button>
                </form>
            </div>
            <button onClick={() => onNavigate('mainHero')} className="mt-6 text-blue-500 hover:text-blue-700 transition duration-150">
                &larr; Kembali ke Beranda
            </button>
        </PageWrapper>
    );
};

const AdminDashboardPage: React.FC<{ onNavigate: (page: string) => void; }> = ({ onNavigate }) => (
    <PageWrapper maxWidth="5xl">
        <h2 className="text-4xl font-extrabold text-blue-900 mb-6 text-center">Selamat Datang, Admin!</h2>
        <p className="text-lg text-gray-600 mb-10 text-center">Anda telah berhasil login ke Dashboard Administrasi PT. Sahabat Intim Plasindo.</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
            <a href="#" onClick={(e) => { e.preventDefault(); onNavigate('employeeInputPage'); }} className="block p-5 bg-green-50 rounded-xl shadow-lg border border-green-200 text-center hover:bg-green-100 transition duration-150">
                <h3 className="text-xl font-bold text-green-800">Update<br/>Karyawan</h3>
                <p className="text-gray-600 mt-2 px-1">Update karyawan baru seperti Nama Karyawan, No. Absen, Bagian, Dll.</p>
            </a>
            <a href="#" onClick={(e) => { e.preventDefault(); onNavigate('employeeListPage'); }} className="block p-5 bg-yellow-50 rounded-xl shadow-lg border border-yellow-200 text-center hover:bg-yellow-100 transition duration-150">
                <h3 className="text-xl font-bold text-yellow-800">Update<br/>Permasalahan<br/>Karyawan</h3>
                <p className="text-gray-600 mt-2 px-1">Update permasalahan, berikan SP atau Potong Gaji.</p>
            </a>
            <a href="#" onClick={(e) => { e.preventDefault(); onNavigate('productionReportPage'); }} className="block p-5 bg-blue-50 rounded-xl shadow-lg border border-blue-200 text-center hover:bg-blue-100 transition duration-150">
                <h3 className="text-xl font-bold text-blue-800">Update<br/>Permasalahan<br/>Produksi</h3>
                <p className="text-gray-600 mt-2 px-1">Laporan permasalahan produksi seperti adanya barang yang BS atau rusak.</p>
            </a>
        </div>
    </PageWrapper>
);

const AboutPage: React.FC<{ onNavigate: (page: string) => void; }> = ({ onNavigate }) => (
    <PageWrapper maxWidth="3xl">
        <div className="text-center">
            <h2 className="text-4xl font-extrabold text-blue-900 mb-6">Tentang Kami</h2>
            <p className="text-lg text-gray-600 mb-8">Didirikan pada tahun 1982, PT. Sahabat Intim Plasindo adalah salah satu produsen peralatan rumah tangga dan furniture plastik terkemuka di Indonesia. Kami berkomitmen untuk terus memperluas pasar, menciptakan produk yang handal dan inovatif, serta meningkatkan praktik bisnis kami untuk menjaga kepuasan pelanggan.</p>
            <p className="text-lg text-gray-600 mb-10">Pertumbuhan kami didorong oleh meningkatnya permintaan pasar, dan desain produk kami berfokus pada fungsi. Selama lebih dari 30 tahun, kami telah menciptakan produk berdasarkan kebutuhan pelanggan dan berfokus pada optimalisasi pengalaman pengguna. Kami berupaya untuk membuat kehidupan sehari-hari lebih nyaman dan teratur, sehingga lebih sederhana dan bebas dari kekacauan.</p>
            <button onClick={() => onNavigate('mainHero')} className="mt-8 text-blue-500 hover:text-blue-700 transition duration-150">
                &larr; Kembali ke Beranda
            </button>
        </div>
    </PageWrapper>
);

const ContactPage: React.FC<{ onNavigate: (page: string) => void; }> = ({ onNavigate }) => {
    const handleContactSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const form = e.target as HTMLFormElement;
        alert('Pesan Anda telah terkirim! (Ini adalah simulasi)');
        form.reset();
    };

    return (
        <PageWrapper maxWidth="xl">
            <h2 className="text-4xl font-extrabold text-blue-900 mb-8 text-center">Hubungi Kami</h2>
            <div className="w-full max-w-md bg-white p-6 sm:p-8 rounded-xl shadow-2xl border border-gray-100 text-left">
                <p className="mb-4"><span className="font-semibold">Alamat:</span> Jalan Peternakan III No. 38, Kota Administrasi Jakarta Barat, Daerah Khusus Ibukota Jakarta 11720, Indonesia</p>
                <p className="mb-4"><span className="font-semibold">Telepon:</span> +62 851-7506-5351</p>
                <p className="mb-4"><span className="font-semibold">Email:</span> admprod21@gmail.com</p>
                
                <h3 className="text-xl font-bold text-gray-700 mt-6 mb-4">Kirim Pesan</h3>
                <form onSubmit={handleContactSubmit}>
                    <input type="text" placeholder="Nama Anda" className="w-full px-4 py-3 border border-gray-300 rounded-lg mb-3" required />
                    <input type="email" placeholder="Email Anda" className="w-full px-4 py-3 border border-gray-300 rounded-lg mb-3" required />
                    <textarea placeholder="Pesan Anda" rows={4} className="w-full px-4 py-3 border border-gray-300 rounded-lg mb-4" required></textarea>
                    <button type="submit" className="w-full bg-red-600 text-white font-bold py-3 rounded-lg hover:bg-red-700 transition">Kirim</button>
                </form>
            </div>
            <button onClick={() => onNavigate('mainHero')} className="mt-6 text-blue-500 hover:text-blue-700 transition duration-150">
                &larr; Kembali ke Beranda
            </button>
        </PageWrapper>
    );
};

const StaticInfoPage: React.FC<{ title: string, content: string, onBack: () => void, titleColor: string }> = ({ title, content, onBack, titleColor }) => (
    <PageWrapper maxWidth="3xl" showBackButton onBack={onBack}>
        <div className="text-center">
            <h2 className={`text-4xl font-extrabold ${titleColor} mb-6`}>{title}</h2>
            <p className="text-lg text-gray-600 mb-10">{content}</p>
            <button onClick={onBack} className="mt-8 text-blue-500 hover:text-blue-700 transition duration-150">
                &larr; Kembali ke Menu Pengguna
            </button>
        </div>
    </PageWrapper>
);

const ProductionReportPage: React.FC<{onBack: () => void}> = ({onBack}) => (
    <PageWrapper maxWidth="3xl" showBackButton onBack={onBack}>
        <div className="text-center">
            <h2 className="text-4xl font-extrabold text-blue-900 mb-6">Update Permasalahan Produksi</h2>
            <p className="text-lg text-gray-600 mb-10">Halaman ini akan berisi laporan barang BS/rusak. (Fitur dalam pengembangan)</p>
            <button onClick={onBack} className="mt-8 text-blue-500 hover:text-blue-700 transition duration-150">
                &larr; Kembali ke Dashboard Admin
            </button>
        </div>
    </PageWrapper>
);

// #endregion --- Page Components ---

// #region --- Complex Feature Components/Pages ---

interface EmployeeTableProps {
    employees: Employee[];
    onActionClick: (employeeId: number) => void;
    actionButtonText: string;
    showCheckboxes: boolean;
    selectedIds: number[];
    onSelectionChange: (ids: number[]) => void;
}

const EmployeeTable: React.FC<EmployeeTableProps> = ({ employees, onActionClick, actionButtonText, showCheckboxes, selectedIds, onSelectionChange }) => {
    
    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            onSelectionChange(employees.map(emp => emp.id));
        } else {
            onSelectionChange([]);
        }
    };

    const handleSelectOne = (id: number) => {
        if (selectedIds.includes(id)) {
            onSelectionChange(selectedIds.filter(selectedId => selectedId !== id));
        } else {
            onSelectionChange([...selectedIds, id]);
        }
    };
    
    return (
        <div className="overflow-x-auto w-full">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        {showCheckboxes && <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-10">
                            <input type="checkbox" onChange={handleSelectAll} checked={selectedIds.length === employees.length && employees.length > 0} className="w-4 h-4 text-green-600 bg-gray-100 border-gray-300 rounded focus:ring-green-500"/>
                        </th>}
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">No.</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama Karyawan</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">No. Absen</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bagian</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tgl Masuk</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {employees.map((emp, index) => (
                        <tr key={emp.id} className="hover:bg-gray-50">
                             {showCheckboxes && <td className="px-6 py-4 whitespace-nowrap">
                                <input type="checkbox" value={emp.id} checked={selectedIds.includes(emp.id)} onChange={() => handleSelectOne(emp.id)} className="w-4 h-4 text-green-600 bg-gray-100 border-gray-300 rounded focus:ring-green-500" />
                            </td>}
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{index + 1}</td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center space-x-3">
                                    <img className="w-10 h-10 rounded-full object-cover" src={emp.fotoBase64 || `https://placehold.co/40x40/eee/333?text=N/A`} alt={emp.nama}/>
                                    <div className="text-sm font-medium text-gray-900">{emp.nama}</div>
                                </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{emp.noAbsen}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{emp.bagian}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{emp.tglMasuk}</td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                    {emp.statusPekerjaan}
                                </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                <button onClick={() => onActionClick(emp.id)} className="text-blue-600 hover:text-blue-900">
                                    {actionButtonText}
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

const EmployeeInputPage: React.FC<{onBack: () => void}> = ({onBack}) => {
    // Component state and logic
    return (
        <PageWrapper maxWidth="6xl" showBackButton onBack={onBack}>
          <div className='w-full'> {/* Implement Employee Input Page UI here */} </div>
        </PageWrapper>
    )
}

const EmployeeListPage: React.FC<{onBack: () => void}> = ({onBack}) => {
    // Component state and logic
    return (
        <PageWrapper maxWidth="7xl" showBackButton onBack={onBack}>
          <div className='w-full'> {/* Implement Employee List for Problems UI here */} </div>
        </PageWrapper>
    )
}

const SearchBiodataPage: React.FC<{onBack: () => void}> = ({onBack}) => {
    // Component state and logic
    return (
        <PageWrapper maxWidth="2xl" showBackButton onBack={onBack}>
            <div className='w-full'>{/* Implement Search Biodata UI here */}</div>
        </PageWrapper>
    )
}


// #endregion --- Complex Feature Components/Pages ---


// Main App Component
const App: React.FC = () => {
    const [currentPage, setCurrentPage] = useState('mainHero');
    const [history, setHistory] = useState<string[]>(['mainHero']);
    const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
    
    // Modals states
    const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

    const navigate = useCallback((page: string, isBackAction = false) => {
        setCurrentPage(page);
        if (!isBackAction) {
            setHistory(prev => [...prev, page]);
        }
    }, []);

    const goBack = useCallback(() => {
        if (history.length > 1) {
            const newHistory = [...history];
            newHistory.pop();
            const prevPage = newHistory[newHistory.length - 1];
            setHistory(newHistory);
            navigate(prevPage, true);
        } else {
            navigate('mainHero');
        }
    }, [history, navigate]);

    const handleLogin = () => {
        setIsAdminLoggedIn(true);
        navigate('adminDashboard');
    };

    const handleLogout = () => {
        setIsAdminLoggedIn(false);
        setHistory(['mainHero']);
        navigate('mainHero');
        setIsLogoutModalOpen(false);
    };

    const getAppState = (): 'public-view' | 'admin-view' | 'user-view' => {
        if (isAdminLoggedIn) return 'admin-view';
        if (['userMenu', 'biodataPage', 'userProblemPage', 'userProductionPage'].includes(currentPage)) return 'user-view';
        return 'public-view';
    };

    const renderPage = () => {
        switch (currentPage) {
            case 'mainHero': return <HomePage />;
            case 'aboutPage': return <AboutPage onNavigate={navigate} />;
            case 'contactPage': return <ContactPage onNavigate={navigate} />;
            case 'userMenu': return <UserMenuPage onNavigate={navigate} onBack={goBack} />;
            case 'adminLogin': return <AdminLoginPage onLogin={handleLogin} onNavigate={navigate} />;
            case 'adminDashboard': return <AdminDashboardPage onNavigate={navigate} />;
            case 'employeeInputPage': return <EmployeeInputPage onBack={goBack} />;
            case 'employeeListPage': return <EmployeeListPage onBack={goBack} />;
            case 'biodataPage': return <SearchBiodataPage onBack={goBack} />;
            case 'userProblemPage': return <StaticInfoPage title="Informasi Permasalahan Karyawan" content="Untuk pertanyaan atau laporan terkait permasalahan personalia, silakan hubungi departemen HRD secara langsung." onBack={goBack} titleColor="text-yellow-800" />;
            case 'userProductionPage': return <StaticInfoPage title="Informasi Permasalahan Produksi" content="Untuk melaporkan masalah produksi seperti barang rusak (BS), silakan hubungi kepala regu atau supervisor di bagian Anda." onBack={goBack} titleColor="text-blue-800" />;
            case 'productionReportPage': return <ProductionReportPage onBack={goBack} />;
            default: return <HomePage />;
        }
    };

    return (
        <div className="min-h-screen relative flex flex-col bg-gray-50">
            <Header appState={getAppState()} onNavigate={navigate} onLogout={() => setIsLogoutModalOpen(true)} />
            
             <div className="flex-grow">
                 {currentPage === 'mainHero' ? (
                    <HomePage />
                ) : (
                    <div className="pt-16">
                        {renderPage()}
                    </div>
                )}
            </div>
            
            <Modal isOpen={isLogoutModalOpen} onClose={() => setIsLogoutModalOpen(false)} size="sm">
                <h3 className="text-xl font-bold text-blue-600 mb-4">Konfirmasi Logout</h3>
                <p className="text-gray-700 mb-6">Apakah Anda yakin ingin keluar dari sesi Admin?</p>
                <div className="flex justify-end gap-3">
                    <button onClick={() => setIsLogoutModalOpen(false)} className="bg-gray-300 text-gray-800 font-semibold py-2 px-4 rounded-lg hover:bg-gray-400 transition">Batal</button>
                    <button onClick={handleLogout} className="bg-red-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-red-700 transition">Ya, Logout</button>
                </div>
            </Modal>
        </div>
    );
};

export default App;
