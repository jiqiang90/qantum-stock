insert into public.solutions (
  id, internal_code, supplier_ref_code, supplier, orientation, substrate,
  service_classification, service_type, service_size, integrity, insulation,
  service_type_option, substrate_option
)
values
  (
    '10000000-0000-0000-0000-000000000001',
    '0444',
    'V21.2-21SFR00051-98-A',
    'Ryanfire',
    'Wall',
    'FR plasterboard, FR plasterboard wall (1 layer 13mm)',
    'Combustible Pipe',
    'PVC Pipe',
    'Ø40mm',
    '60',
    '60',
    'PVC Pipe',
    'Plasterboard Wall'
  ),
  (
    '10000000-0000-0000-0000-000000000002',
    '0485',
    'V22.11-PF 19060-74-B',
    'Ryanfire',
    'Floor',
    'Timber Infill, 100mm timber infill floor',
    'Combustible Pipe',
    'PVC Pipe',
    'Ø50mm',
    '90',
    '90',
    'PVC Pipe',
    'Timber Infill Floor'
  ),
  (
    '10000000-0000-0000-0000-000000000003',
    '0659',
    'V27.8-PF 19010-62-15',
    'Ryanfire',
    'Wall',
    'FR plasterboard, FR plasterboard wall (1 layer 13mm)',
    'Electrical Penetration',
    'Cable Tray D1',
    '300mm',
    '60',
    '60',
    'Cable Tray',
    'Plasterboard Wall'
  ),
  (
    '10000000-0000-0000-0000-000000000004',
    '0510',
    'V22.35-22SFR00072-181-C',
    'Ryanfire',
    'Ceiling',
    'FR plasterboard, FR plasterboard ceiling (1 layer 16mm)',
    'Electrical Penetration',
    'PVC Conduit',
    'Ø25mm',
    '60',
    '60',
    'PVC Conduit',
    'Plasterboard Ceiling'
  ),
  (
    '10000000-0000-0000-0000-000000000005',
    '0334',
    'V1.11-22SFR00038-146-E',
    'Ryanfire',
    'Wall',
    'FR plasterboard, FR plasterboard wall (1 layer 13mm)',
    'Non-Combustible Pipe',
    'Copper Pipe',
    'Ø100mm',
    '60',
    '-',
    'Copper Pipe',
    'Plasterboard Wall'
  ),
  (
    '10000000-0000-0000-0000-000000000006',
    '0375',
    'V15.1-21SFR00018-130-D',
    'Ryanfire',
    'Wall',
    'FR plasterboard, FR plasterboard wall (2 layers 13mm)',
    'Insulated Pipe',
    'Copper Pipe  - 50mm Fibreglass',
    'Ø32mm',
    '60',
    '60',
    'Insulated Copper Pipe',
    'Plasterboard Wall'
  ),
  (
    '10000000-0000-0000-0000-000000000007',
    '0521',
    'V22.44-22SFR00074-171-C',
    'Ryanfire',
    'Floor',
    'Concrete, 125mm concrete floor',
    'Combustible Pipe',
    'PVC Pipe',
    'Ø100mm',
    '60',
    '60',
    'PVC Pipe',
    'Concrete Floor'
  ),
  (
    '10000000-0000-0000-0000-000000000008',
    '0512',
    'V22.36-23SFR00075-234-G',
    'Ryanfire',
    'Floor',
    'CLT, 103mm CLT floor',
    'Combustible Pipe',
    'PVC Pipe',
    'Ø80mm',
    '60',
    '60',
    'PVC Pipe',
    'CLT Floor'
  ),
  (
    '10000000-0000-0000-0000-000000000009',
    '0455',
    'V21.30-22SFR00073-184-B',
    'Ryanfire',
    'Wall',
    'KOROK®, KOROK® wall (78mm)',
    'Combustible Pipe',
    'PVC Pipe',
    'Ø65mm',
    '120',
    '120',
    'PVC Pipe',
    'Korok Wall'
  ),
  (
    '10000000-0000-0000-0000-000000000010',
    '0677',
    'V29.24-21SFR00057-105-A',
    'Ryanfire',
    'Ceiling',
    'FR plasterboard, FR plasterboard ceiling (1 layer 16mm)',
    'Electrical Penetration',
    'Cable Bundle TPS',
    'Ø100mm',
    '60',
    '60',
    'Cable (Single or Bundle)',
    'Plasterboard Ceiling'
  ),
  (
    '10000000-0000-0000-0000-000000000011',
    '0470',
    'V21.42-23SFR00089-280-I',
    'Ryanfire',
    'Wall',
    'AFS Logicwall®, AFS Logicwall®',
    'Combustible Pipe',
    'PVC Pipe',
    'Ø65mm',
    '120',
    '120',
    'PVC Pipe',
    'AFS Logic Wall'
  ),
  (
    '10000000-0000-0000-0000-000000000012',
    '0918',
    'V64.20-23SFR00097-266-B',
    'Ryanfire',
    'Wall',
    'FR plasterboard, 190mm Glulam timber beam (1 layer 19mm)',
    'Structural Penetration',
    'Timber Beam',
    '190mm',
    '120',
    '120',
    'Timber Beam',
    'Plasterboard Wall'
  );

insert into public.work_packages (id, name, planned_date, solution_id)
values
  (
    '20000000-0000-0000-0000-000000000001',
    'Level 2 service riser firestopping',
    '2026-10-06',
    '10000000-0000-0000-0000-000000000001'
  ),
  (
    '20000000-0000-0000-0000-000000000002',
    'Level 3 east riser firestopping',
    '2026-10-07',
    '10000000-0000-0000-0000-000000000001'
  ),
  (
    '20000000-0000-0000-0000-000000000003',
    'Level 1 timber floor penetrations',
    '2026-10-08',
    '10000000-0000-0000-0000-000000000002'
  ),
  (
    '20000000-0000-0000-0000-000000000004',
    'Level 2 timber floor penetrations',
    '2026-10-09',
    '10000000-0000-0000-0000-000000000002'
  ),
  (
    '20000000-0000-0000-0000-000000000005',
    'East core cable tray opening',
    '2026-10-10',
    '10000000-0000-0000-0000-000000000003'
  ),
  (
    '20000000-0000-0000-0000-000000000006',
    'Level 3 ceiling conduit penetrations',
    '2026-10-11',
    '10000000-0000-0000-0000-000000000004'
  );

insert into public.products (
  id, product_code, name, category, manufacturer, supplier_product_code,
  variant, description, canonical_unit
)
values
  (
    '30000000-0000-0000-0000-000000000001',
    'SC-040',
    'SC-040 Fire Collar',
    'Fire collar',
    'Northstar Passive Systems',
    'NPS-SC040',
    '40 mm collar',
    'Rigid collar for combustible pipe penetrations.',
    'each'
  ),
  (
    '30000000-0000-0000-0000-000000000002',
    'IS-310',
    'IS-310 Intumescent Sealant 310 ml',
    'Sealant',
    'Northstar Passive Systems',
    'NPS-IS310',
    '310 ml cartridge',
    'Intumescent sealant for joints and annular gaps around service penetrations.',
    'cartridge'
  ),
  (
    '30000000-0000-0000-0000-000000000003',
    'CS-010',
    'CS-010 Conduit Seal Pack',
    'Conduit seal',
    'Northstar Passive Systems',
    'NPS-CS010',
    '10-piece pack',
    'Preformed seal pack for small conduit penetrations.',
    'pack'
  ),
  (
    '30000000-0000-0000-0000-000000000004',
    'FB-1200',
    'FB-1200 Fire-Resistant Board',
    'Fire-resistant board',
    'Northstar Passive Systems',
    'NPS-FB1200',
    '1200 × 600 × 25 mm sheet',
    'Fire-resistant board for closing and reinstating larger openings.',
    'sheet'
  ),
  (
    '30000000-0000-0000-0000-000000000005',
    'PW-050',
    'PW-050 Firestop Pipe Wrap',
    'Pipe wrap',
    'Northstar Passive Systems',
    'NPS-PW050',
    '50 mm × 10 m roll',
    'Flexible wrap for combustible pipe penetrations.',
    'roll'
  );

insert into public.solution_products (id, solution_id, product_id)
values
  (
    '60000000-0000-0000-0000-000000000001',
    '10000000-0000-0000-0000-000000000001',
    '30000000-0000-0000-0000-000000000001'
  ),
  (
    '60000000-0000-0000-0000-000000000002',
    '10000000-0000-0000-0000-000000000001',
    '30000000-0000-0000-0000-000000000002'
  ),
  (
    '60000000-0000-0000-0000-000000000003',
    '10000000-0000-0000-0000-000000000001',
    '30000000-0000-0000-0000-000000000004'
  ),
  (
    '60000000-0000-0000-0000-000000000004',
    '10000000-0000-0000-0000-000000000002',
    '30000000-0000-0000-0000-000000000005'
  ),
  (
    '60000000-0000-0000-0000-000000000005',
    '10000000-0000-0000-0000-000000000002',
    '30000000-0000-0000-0000-000000000002'
  ),
  (
    '60000000-0000-0000-0000-000000000007',
    '10000000-0000-0000-0000-000000000003',
    '30000000-0000-0000-0000-000000000002'
  ),
  (
    '60000000-0000-0000-0000-000000000008',
    '10000000-0000-0000-0000-000000000003',
    '30000000-0000-0000-0000-000000000004'
  ),
  (
    '60000000-0000-0000-0000-000000000009',
    '10000000-0000-0000-0000-000000000004',
    '30000000-0000-0000-0000-000000000003'
  ),
  (
    '60000000-0000-0000-0000-000000000011',
    '10000000-0000-0000-0000-000000000004',
    '30000000-0000-0000-0000-000000000002'
  );

insert into public.product_requirements (
  id, work_package_id, position, description, solution_product_id,
  required_quantity
)
values
  (
    '40000000-0000-0000-0000-000000000001',
    '20000000-0000-0000-0000-000000000001',
    0,
    'Install collars to service-riser PVC pipe penetrations',
    '60000000-0000-0000-0000-000000000001',
    6
  ),
  (
    '40000000-0000-0000-0000-000000000002',
    '20000000-0000-0000-0000-000000000001',
    1,
    'Seal annular gaps around service-riser penetrations',
    '60000000-0000-0000-0000-000000000002',
    4
  ),
  (
    '40000000-0000-0000-0000-000000000003',
    '20000000-0000-0000-0000-000000000001',
    2,
    'Provide fire-resistant board for riser wall reinstatement',
    '60000000-0000-0000-0000-000000000003',
    6
  ),
  (
    '40000000-0000-0000-0000-000000000004',
    '20000000-0000-0000-0000-000000000002',
    0,
    'Install collars to east-riser PVC pipe penetrations',
    '60000000-0000-0000-0000-000000000001',
    4
  ),
  (
    '40000000-0000-0000-0000-000000000005',
    '20000000-0000-0000-0000-000000000002',
    1,
    'Seal annular gaps around east-riser penetrations',
    '60000000-0000-0000-0000-000000000002',
    6
  ),
  (
    '40000000-0000-0000-0000-000000000006',
    '20000000-0000-0000-0000-000000000002',
    2,
    'Provide fire-resistant board for east-riser wall reinstatement',
    '60000000-0000-0000-0000-000000000003',
    8
  ),
  (
    '40000000-0000-0000-0000-000000000007',
    '20000000-0000-0000-0000-000000000003',
    0,
    'Wrap PVC pipe penetrations through the Level 1 timber infill floor',
    '60000000-0000-0000-0000-000000000004',
    4
  ),
  (
    '40000000-0000-0000-0000-000000000017',
    '20000000-0000-0000-0000-000000000003',
    1,
    'Seal gaps around Level 1 timber-floor penetrations',
    '60000000-0000-0000-0000-000000000005',
    4
  ),
  (
    '40000000-0000-0000-0000-000000000008',
    '20000000-0000-0000-0000-000000000004',
    0,
    'Wrap PVC pipe penetrations through the Level 2 timber infill floor',
    '60000000-0000-0000-0000-000000000004',
    2
  ),
  (
    '40000000-0000-0000-0000-000000000009',
    '20000000-0000-0000-0000-000000000004',
    1,
    'Seal gaps around Level 2 timber-floor penetrations',
    '60000000-0000-0000-0000-000000000005',
    10
  ),
  (
    '40000000-0000-0000-0000-000000000011',
    '20000000-0000-0000-0000-000000000005',
    0,
    'Seal the east-core cable-tray opening',
    '60000000-0000-0000-0000-000000000007',
    12
  ),
  (
    '40000000-0000-0000-0000-000000000012',
    '20000000-0000-0000-0000-000000000005',
    1,
    'Provide fire-resistant board around the cable-tray opening',
    '60000000-0000-0000-0000-000000000008',
    3
  ),
  (
    '40000000-0000-0000-0000-000000000013',
    '20000000-0000-0000-0000-000000000005',
    2,
    'Provide the nominated accessory for the remaining cable-tray gap',
    null,
    null
  ),
  (
    '40000000-0000-0000-0000-000000000014',
    '20000000-0000-0000-0000-000000000006',
    0,
    'Seal ceiling conduit penetrations',
    '60000000-0000-0000-0000-000000000009',
    6
  ),
  (
    '40000000-0000-0000-0000-000000000016',
    '20000000-0000-0000-0000-000000000006',
    2,
    'Seal remaining mixed-service penetrations',
    '60000000-0000-0000-0000-000000000011',
    null
  );

insert into public.inventory_snapshots (id, product_id, available_quantity, captured_at)
values
  (
    '50000000-0000-0000-0000-000000000001',
    '30000000-0000-0000-0000-000000000001',
    10,
    '2026-10-01T20:00:00Z'
  ),
  (
    '50000000-0000-0000-0000-000000000002',
    '30000000-0000-0000-0000-000000000002',
    14,
    '2026-10-01T21:00:00Z'
  ),
  (
    '50000000-0000-0000-0000-000000000003',
    '30000000-0000-0000-0000-000000000002',
    8,
    '2026-10-01T21:00:00Z'
  ),
  (
    '50000000-0000-0000-0000-000000000005',
    '30000000-0000-0000-0000-000000000004',
    20,
    '2026-10-01T23:00:00Z'
  ),
  (
    '50000000-0000-0000-0000-000000000006',
    '30000000-0000-0000-0000-000000000005',
    0,
    '2026-10-02T00:00:00Z'
  );
