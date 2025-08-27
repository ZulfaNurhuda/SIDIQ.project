/**
 * @project SIDIQ.project
 * @author ZulfaNurhuda
 * @github https://github.com/ZulfaNurhuda/SIDIQ.project
 * @description File ini berisi fungsi-fungsi utilitas untuk mengekspor data ke berbagai format.
 */

import * as XLSX from 'xlsx';
import { IuranSubmission } from '@/types';

/**
 * @function exportToXLSX
 * @description Mengekspor array data IuranSubmission ke file XLSX (Excel).
 * @param {IuranSubmission[]} data - Data yang akan diekspor.
 * @param {string} [filename='data-iuran'] - Nama file yang diinginkan tanpa ekstensi.
 */
export function exportToXLSX(data: IuranSubmission[], filename: string = 'data-iuran') {
    /* Ubah data untuk format ekspor yang lebih mudah dibaca. */
    const exportData = data.map(item => ({
        'ID': item.id,
        'Nama Jamaah': item.nama_jamaah,
        'Bulan/Tahun': new Date(item.bulan_tahun).toLocaleDateString('id-ID', {
            month: 'long',
            year: 'numeric'
        }),
        'Tanggal Submit': new Date(item.timestamp_submitted).toLocaleDateString('id-ID'),
        'Iuran 1': item.iuran_1,
        'Iuran 2': item.iuran_2,
        'Iuran 3': item.iuran_3,
        'Iuran 4': item.iuran_4,
        'Iuran 5': item.iuran_5,
        'Total Iuran': item.total_iuran,
        'Dibuat': new Date(item.created_at).toLocaleDateString('id-ID'),
        'Diupdate': new Date(item.updated_at).toLocaleDateString('id-ID'),
    }));

    /* Buat worksheet baru dari data yang telah diubah. */
    const worksheet = XLSX.utils.json_to_sheet(exportData);
    /* Buat workbook baru. */
    const workbook = XLSX.utils.book_new();

    /* Tambahkan worksheet ke workbook. */
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Data Iuran');

    /* Atur lebar kolom secara otomatis agar lebih mudah dibaca. */
    const cols = Object.keys(exportData[0] || {}).map(() => ({ wch: 15 }));
    worksheet['!cols'] = cols;

    /* Tulis workbook ke file dan picu unduhan. */
    XLSX.writeFile(workbook, `${filename}.xlsx`);
}

/**
 * @function exportToCSV
 * @description Mengekspor array data IuranSubmission ke file CSV.
 * @param {IuranSubmission[]} data - Data yang akan diekspor.
 * @param {string} [filename='data-iuran'] - Nama file yang diinginkan tanpa ekstensi.
 */
export function exportToCSV(data: IuranSubmission[], filename: string = 'data-iuran') {
    /* Ubah data untuk format ekspor yang lebih mudah dibaca. */
    const exportData = data.map(item => ({
        'ID': item.id,
        'Nama Jamaah': item.nama_jamaah,
        'Bulan/Tahun': new Date(item.bulan_tahun).toLocaleDateString('id-ID', {
            month: 'long',
            year: 'numeric'
        }),
        'Tanggal Submit': new Date(item.timestamp_submitted).toLocaleDateString('id-ID'),
        'Iuran 1': item.iuran_1,
        'Iuran 2': item.iuran_2,
        'Iuran 3': item.iuran_3,
        'Iuran 4': item.iuran_4,
        'Iuran 5': item.iuran_5,
        'Total Iuran': item.total_iuran,
        'Dibuat': new Date(item.created_at).toLocaleDateString('id-ID'),
        'Diupdate': new Date(item.updated_at).toLocaleDateString('id-ID'),
    }));

    /* Buat worksheet dan konversi ke format CSV. */
    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const csv = XLSX.utils.sheet_to_csv(worksheet);

    /* Buat Blob dari string CSV. */
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    /* Buat elemen link untuk memicu unduhan. */
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}.csv`);
    link.style.visibility = 'hidden';

    /* Tambahkan, klik, dan hapus link untuk memicu unduhan. */
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

/**
 * @function exportToJSON
 * @description Mengekspor array data IuranSubmission ke file JSON.
 * @param {IuranSubmission[]} data - Data yang akan diekspor.
 * @param {string} [filename='data-iuran'] - Nama file yang diinginkan tanpa ekstensi.
 */
export function exportToJSON(data: IuranSubmission[], filename: string = 'data-iuran') {
    /* Buat objek yang berisi metadata dan data itu sendiri. */
    const exportData = {
        exported_at: new Date().toISOString(),
        total_records: data.length,
        data: data.map(item => ({
            id: item.id,
            nama_jamaah: item.nama_jamaah,
            bulan_tahun: item.bulan_tahun,
            timestamp_submitted: item.timestamp_submitted,
            iuran_1: item.iuran_1,
            iuran_2: item.iuran_2,
            iuran_3: item.iuran_3,
            iuran_4: item.iuran_4,
            iuran_5: item.iuran_5,
            total_iuran: item.total_iuran,
            created_at: item.created_at,
            updated_at: item.updated_at,
        }))
    };

    /* Konversi objek data menjadi string JSON yang diformat. */
    const jsonString = JSON.stringify(exportData, null, 2);
    /* Buat Blob dari string JSON. */
    const blob = new Blob([jsonString], { type: 'application/json' });
    /* Buat elemen link untuk memicu unduhan. */
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}.json`);
    link.style.visibility = 'hidden';

    /* Tambahkan, klik, dan hapus link untuk memicu unduhan. */
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

/**
 * @function exportToXML
 * @description Mengekspor array data IuranSubmission ke file XML.
 * @param {IuranSubmission[]} data - Data yang akan diekspor.
 * @param {string} [filename='data-iuran'] - Nama file yang diinginkan tanpa ekstensi.
 */
export function exportToXML(data: IuranSubmission[], filename: string = 'data-iuran') {
    /* Definisikan string struktur XML. */
    const xmlHeader = '<?xml version="1.0" encoding="UTF-8"?>\n';
    const xmlRoot = '<iuran_data>\n';
    const xmlFooter = '</iuran_data>';

    /* Bangun string konten XML. */
    let xmlContent = xmlHeader + xmlRoot;
    xmlContent += `  <meta>
`;
    xmlContent += `    <exported_at>${new Date().toISOString()}</exported_at>
`;
    xmlContent += `    <total_records>${data.length}</total_records>
`;
    xmlContent += `  </meta>
`;
    xmlContent += `  <submissions>
`;

    /* Iterasi data untuk membuat node XML untuk setiap entri. */
    data.forEach(item => {
        xmlContent += `    <submission>
`;
        xmlContent += `      <id>${item.id}</id>
`;
        xmlContent += `      <nama_jamaah><![CDATA[${item.nama_jamaah}]]></nama_jamaah>
`;
        xmlContent += `      <bulan_tahun>${item.bulan_tahun}</bulan_tahun>
`;
        xmlContent += `      <timestamp_submitted>${item.timestamp_submitted}</timestamp_submitted>
`;
        xmlContent += `      <iuran_1>${item.iuran_1}</iuran_1>
`;
        xmlContent += `      <iuran_2>${item.iuran_2}</iuran_2>
`;
        xmlContent += `      <iuran_3>${item.iuran_3}</iuran_3>
`;
        xmlContent += `      <iuran_4>${item.iuran_4}</iuran_4>
`;
        xmlContent += `      <iuran_5>${item.iuran_5}</iuran_5>
`;
        xmlContent += `      <total_iuran>${item.total_iuran}</total_iuran>
`;
        xmlContent += `      <created_at>${item.created_at}</created_at>
`;
        xmlContent += `      <updated_at>${item.updated_at}</updated_at>
`;
        xmlContent += `    </submission>
`;
    });

    xmlContent += `  </submissions>
`;
    xmlContent += xmlFooter;

    /* Buat Blob dari string XML. */
    const blob = new Blob([xmlContent], { type: 'application/xml' });
    /* Buat elemen link untuk memicu unduhan. */
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}.xml`);
    link.style.visibility = 'hidden';

    /* Tambahkan, klik, dan hapus link untuk memicu unduhan. */
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}
