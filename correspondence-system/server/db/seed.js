export async function seedDatabase(db) {
  // Check if government_entities exists
  const entityCount = await db.get('SELECT COUNT(*) as count FROM government_entities');
  if (entityCount.count > 0) return;

  console.log('Seeding initial reference data and sample cases...');

  // 1. Government Entities
  const entities = [
    { id: 1, english_name: 'Ministry of Industry and Mineral Resources', arabic_name: 'وزارة الصناعة والثروة المعدنية' },
    { id: 2, english_name: 'Example Government Entity', arabic_name: 'الجهة الحكومية النموذجية' },
    { id: 3, english_name: 'Ministry of Environment, Water and Agriculture', arabic_name: 'وزارة البيئة والمياه والزراعة' },
    { id: 4, english_name: 'Royal Commission for Jubail and Yanbu', arabic_name: 'الهيئة الملكية للجبيل وينبع' }
  ];

  for (const item of entities) {
    await db.run('INSERT INTO government_entities (id, english_name, arabic_name) VALUES (?, ?, ?)', [item.id, item.english_name, item.arabic_name]);
    await db.run('INSERT OR IGNORE INTO translation_dictionary (english_value, arabic_value) VALUES (?, ?)', [item.english_name, item.arabic_name]);
  }

  // 2. Department Names (Hierarchical: belongs to Government Entity)
  const departments = [
    { id: 1, government_entity_id: 1, english_name: 'Projects Department', arabic_name: 'إدارة المشاريع' },
    { id: 2, government_entity_id: 2, english_name: 'Permits and Clearances Affairs', arabic_name: 'شؤون التصاريح والموافقات' },
    { id: 3, government_entity_id: 3, english_name: 'Engineering & Construction Directorate', arabic_name: 'مديرية الهندسة والإنشاءات' },
    { id: 4, government_entity_id: 4, english_name: 'Environmental Compliance Department', arabic_name: 'إدارة الالتزام البيئي' }
  ];

  for (const item of departments) {
    await db.run('INSERT INTO department_names (id, government_entity_id, english_name, arabic_name) VALUES (?, ?, ?, ?)', [item.id, item.government_entity_id, item.english_name, item.arabic_name]);
    await db.run('INSERT OR IGNORE INTO translation_dictionary (english_value, arabic_value) VALUES (?, ?)', [item.english_name, item.arabic_name]);
  }

  // 3. Title Addresses (Hierarchical: belongs to Department Name)
  const titles = [
    { id: 1, department_name_id: 1, english_value: 'His Excellency Director General', arabic_value: 'سعادة المدير العام المحترم' },
    { id: 2, department_name_id: 2, english_value: 'His Excellency Minister', arabic_value: 'معالي الوزير المحترم' },
    { id: 3, department_name_id: 3, english_value: 'Head of Approvals Committee', arabic_value: 'رئيس لجنة الموافقات المحترم' }
  ];

  for (const item of titles) {
    await db.run('INSERT INTO title_addresses (id, department_name_id, english_value, arabic_value) VALUES (?, ?, ?, ?)', [item.id, item.department_name_id, item.english_value, item.arabic_value]);
    await db.run('INSERT OR IGNORE INTO translation_dictionary (english_value, arabic_value) VALUES (?, ?)', [item.english_value, item.arabic_value]);
  }

  // 4. Government Affairs (Hierarchical: belongs to Title Address)
  const affairs = [
    { id: 1, title_address_id: 1, english_name: 'Permits & Licensing', arabic_name: 'التراخيص والتصاريح' },
    { id: 2, title_address_id: 2, english_name: 'Site Allocation & Land Use', arabic_name: 'تخصيص المواقع واستخدام الأراضي' },
    { id: 3, title_address_id: 3, english_name: 'Safety & Environmental Standards', arabic_name: 'معايير السلامة والبيئة' }
  ];

  for (const item of affairs) {
    await db.run('INSERT INTO government_affairs (id, title_address_id, english_name, arabic_name) VALUES (?, ?, ?, ?)', [item.id, item.title_address_id, item.english_name, item.arabic_name]);
    await db.run('INSERT OR IGNORE INTO translation_dictionary (english_value, arabic_value) VALUES (?, ?)', [item.english_name, item.arabic_name]);
  }

  // 5. Cities
  const cities = [
    { province: 'Western', english_name: 'Jeddah', arabic_name: 'جدة' },
    { province: 'Western', english_name: 'Makkah', arabic_name: 'مكة المكرمة' },
    { province: 'Western', english_name: 'Taif', arabic_name: 'الطائف' },
    { province: 'Central', english_name: 'Riyadh', arabic_name: 'الرياض' },
    { province: 'Eastern', english_name: 'Dammam', arabic_name: 'الدمام' },
    { province: 'Eastern', english_name: 'Khobar', arabic_name: 'الخبر' },
    { province: 'Eastern', english_name: 'Jubail', arabic_name: 'الجبيل' }
  ];

  for (const item of cities) {
    await db.run('INSERT INTO cities (province, english_name, arabic_name) VALUES (?, ?, ?)', [item.province, item.english_name, item.arabic_name]);
    await db.run('INSERT OR IGNORE INTO translation_dictionary (english_value, arabic_value) VALUES (?, ?)', [item.english_name, item.arabic_name]);
  }

  // 6. Translation Dictionary Setup
  const dictionary = [
    { english_value: 'Western', arabic_value: 'المنطقة الغربية' },
    { english_value: 'Central', arabic_value: 'المنطقة الوسطى' },
    { english_value: 'Eastern', arabic_value: 'المنطقة الشرقية' },
    { english_value: 'Immediate', arabic_value: 'فوري' },
    { english_value: 'Urgent', arabic_value: 'عاجل' },
    { english_value: 'Normal', arabic_value: 'عادي' },
    { english_value: 'Restricted', arabic_value: 'مقيد' },
    { english_value: 'Confidential', arabic_value: 'سري' },
    { english_value: 'Public', arabic_value: 'عام' }
  ];

  for (const item of dictionary) {
    await db.run('INSERT OR IGNORE INTO translation_dictionary (english_value, arabic_value) VALUES (?, ?)', [item.english_value, item.arabic_value]);
  }

  // 7. Sample Case setup
  await db.run(
    'INSERT INTO cases (id, case_number, title, government_entity_id, province, city, project_type, work_method, project_description, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [1, 'CASE-2026-001', 'Example Project Work Permit', 2, 'Eastern', 'Dammam', 'Pipeline', 'HDD', 'Construction and site mobilization for the new example facility in Dammam industrial sector, requiring environmental permit issuance.', 'New']
  );

  console.log('Seed database initialized successfully!');
}
