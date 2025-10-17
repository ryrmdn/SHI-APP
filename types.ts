
export interface Employee {
  id: number;
  created_at: string;
  nama: string;
  noAbsen: string;
  tglMasuk: string;
  statusPekerjaan: string;
  bagian: string;
  pendidikan: string;
  agama: string;
  jenisKelamin: string;
  tptTglLahir: string;
  statusKawin: string;
  noWa: string;
  alamat: string;
  fotoBase64: string | null;
}

export interface EmployeeProblem {
    id: number;
    created_at: string;
    employee_id: number;
    problem_type: 'SP' | 'Potong Gaji';
    problem_date: string;
    problem_level: 'SP I' | 'SP II' | null;
    detail: string;
    nominal: number | null;
}
