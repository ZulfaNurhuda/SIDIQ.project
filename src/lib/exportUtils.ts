import * as XLSX from 'xlsx';
import { IuranSubmission } from '@/types';

export function exportToXLSX(data: IuranSubmission[], filename: string = 'data-iuran') {
  // Transform data for export
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

  const worksheet = XLSX.utils.json_to_sheet(exportData);
  const workbook = XLSX.utils.book_new();
  
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Data Iuran');
  
  // Auto-size columns
  const cols = Object.keys(exportData[0] || {}).map(() => ({ wch: 15 }));
  worksheet['!cols'] = cols;

  XLSX.writeFile(workbook, `${filename}.xlsx`);
}

export function exportToCSV(data: IuranSubmission[], filename: string = 'data-iuran') {
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

  const worksheet = XLSX.utils.json_to_sheet(exportData);
  const csv = XLSX.utils.sheet_to_csv(worksheet);
  
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function exportToJSON(data: IuranSubmission[], filename: string = 'data-iuran') {
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

  const jsonString = JSON.stringify(exportData, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.json`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function exportToXML(data: IuranSubmission[], filename: string = 'data-iuran') {
  const xmlHeader = '<?xml version="1.0" encoding="UTF-8"?>\n';
  const xmlRoot = '<iuran_data>\n';
  const xmlFooter = '</iuran_data>';
  
  let xmlContent = xmlHeader + xmlRoot;
  xmlContent += `  <meta>\n`;
  xmlContent += `    <exported_at>${new Date().toISOString()}</exported_at>\n`;
  xmlContent += `    <total_records>${data.length}</total_records>\n`;
  xmlContent += `  </meta>\n`;
  xmlContent += `  <submissions>\n`;
  
  data.forEach(item => {
    xmlContent += `    <submission>\n`;
    xmlContent += `      <id>${item.id}</id>\n`;
    xmlContent += `      <nama_jamaah><![CDATA[${item.nama_jamaah}]]></nama_jamaah>\n`;
    xmlContent += `      <bulan_tahun>${item.bulan_tahun}</bulan_tahun>\n`;
    xmlContent += `      <timestamp_submitted>${item.timestamp_submitted}</timestamp_submitted>\n`;
    xmlContent += `      <iuran_1>${item.iuran_1}</iuran_1>\n`;
    xmlContent += `      <iuran_2>${item.iuran_2}</iuran_2>\n`;
    xmlContent += `      <iuran_3>${item.iuran_3}</iuran_3>\n`;
    xmlContent += `      <iuran_4>${item.iuran_4}</iuran_4>\n`;
    xmlContent += `      <iuran_5>${item.iuran_5}</iuran_5>\n`;
    xmlContent += `      <total_iuran>${item.total_iuran}</total_iuran>\n`;
    xmlContent += `      <created_at>${item.created_at}</created_at>\n`;
    xmlContent += `      <updated_at>${item.updated_at}</updated_at>\n`;
    xmlContent += `    </submission>\n`;
  });
  
  xmlContent += `  </submissions>\n`;
  xmlContent += xmlFooter;
  
  const blob = new Blob([xmlContent], { type: 'application/xml' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.xml`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}