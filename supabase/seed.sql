insert into public.solutions (id, name)
values
  (
    '10000000-0000-0000-0000-000000000001',
    'Sample plasterboard wall PVC conduit penetration system'
  ),
  (
    '10000000-0000-0000-0000-000000000002',
    'Sample plasterboard wall copper pipe penetration system'
  ),
  (
    '10000000-0000-0000-0000-000000000003',
    'Sample concrete floor PVC pipe penetration system'
  ),
  (
    '10000000-0000-0000-0000-000000000004',
    'Sample timber infill floor PVC pipe penetration system'
  ),
  (
    '10000000-0000-0000-0000-000000000005',
    'Sample plasterboard wall cable tray penetration system'
  ),
  (
    '10000000-0000-0000-0000-000000000006',
    'Sample plasterboard ceiling PVC pipe penetration system'
  ),
  (
    '10000000-0000-0000-0000-000000000007',
    'Sample plasterboard wall insulated copper pipe penetration system'
  ),
  (
    '10000000-0000-0000-0000-000000000008',
    'Sample plasterboard wall cable bundle penetration system'
  ),
  (
    '10000000-0000-0000-0000-000000000009',
    'Sample plasterboard wall timber beam penetration system'
  );

insert into public.work_packages (
  id,
  name,
  planned_date,
  solution_id
)
values
  (
    '20000000-0000-0000-0000-000000000001',
    'Sample: Wall penetration exactly supplied',
    '2026-10-06',
    '10000000-0000-0000-0000-000000000001'
  ),
  (
    '20000000-0000-0000-0000-000000000002',
    'Sample: Wall penetration with multiple products',
    '2026-10-07',
    '10000000-0000-0000-0000-000000000002'
  ),
  (
    '20000000-0000-0000-0000-000000000003',
    'Sample: Concrete floor partial shortage',
    '2026-10-08',
    '10000000-0000-0000-0000-000000000003'
  ),
  (
    '20000000-0000-0000-0000-000000000004',
    'Sample: Timber floor with zero available',
    '2026-10-09',
    '10000000-0000-0000-0000-000000000004'
  ),
  (
    '20000000-0000-0000-0000-000000000005',
    'Sample: Cable tray with shortage and unresolved item',
    '2026-10-10',
    '10000000-0000-0000-0000-000000000005'
  ),
  (
    '20000000-0000-0000-0000-000000000006',
    'Sample: Ceiling penetration with unmapped product',
    '2026-10-11',
    '10000000-0000-0000-0000-000000000006'
  ),
  (
    '20000000-0000-0000-0000-000000000007',
    'Sample: Insulated pipe with unknown demand',
    '2026-10-12',
    '10000000-0000-0000-0000-000000000007'
  ),
  (
    '20000000-0000-0000-0000-000000000008',
    'Sample: Cable bundle with no inventory evidence',
    '2026-10-13',
    '10000000-0000-0000-0000-000000000008'
  ),
  (
    '20000000-0000-0000-0000-000000000009',
    'Sample: Structural penetration awaiting requirements',
    '2026-10-14',
    '10000000-0000-0000-0000-000000000009'
  );

insert into public.products (id, product_code, name, canonical_unit)
values
  (
    '30000000-0000-0000-0000-000000000001',
    'DEMO-SC-100',
    'SampleShield SC-100 Fire Collar',
    'each'
  ),
  (
    '30000000-0000-0000-0000-000000000002',
    'DEMO-IS-310',
    'SampleSeal IS-310 Intumescent Sealant 310 ml',
    'cartridge'
  ),
  (
    '30000000-0000-0000-0000-000000000003',
    'DEMO-CS-010',
    'SampleSeal CS-10 Conduit Seal Pack',
    'pack'
  ),
  (
    '30000000-0000-0000-0000-000000000004',
    'DEMO-FB-1200',
    'SampleBoard FB-1200 Fire-Resistant Board',
    'sheet'
  ),
  (
    '30000000-0000-0000-0000-000000000005',
    'DEMO-PW-050',
    'SampleWrap PW-50 Firestop Pipe Wrap',
    'roll'
  ),
  (
    '30000000-0000-0000-0000-000000000006',
    'DEMO-CP-200',
    'SamplePillow CP-200 Cable Firestop Pillow Pack',
    'pack'
  );

insert into public.product_requirements (
  id,
  work_package_id,
  position,
  description,
  product_id,
  required_quantity
)
values
  (
    '40000000-0000-0000-0000-000000000001',
    '20000000-0000-0000-0000-000000000001',
    0,
    'Seal ten PVC conduit penetrations',
    '30000000-0000-0000-0000-000000000003',
    10
  ),
  (
    '40000000-0000-0000-0000-000000000002',
    '20000000-0000-0000-0000-000000000002',
    0,
    'Seal five copper-pipe penetrations',
    '30000000-0000-0000-0000-000000000002',
    5
  ),
  (
    '40000000-0000-0000-0000-000000000003',
    '20000000-0000-0000-0000-000000000002',
    1,
    'Provide fire-resistant board for wall penetration framing',
    '30000000-0000-0000-0000-000000000004',
    5
  ),
  (
    '40000000-0000-0000-0000-000000000004',
    '20000000-0000-0000-0000-000000000003',
    0,
    'Install collars to twelve PVC pipe penetrations through concrete floor',
    '30000000-0000-0000-0000-000000000001',
    12
  ),
  (
    '40000000-0000-0000-0000-000000000005',
    '20000000-0000-0000-0000-000000000004',
    0,
    'Wrap four PVC pipe penetrations through timber infill floor',
    '30000000-0000-0000-0000-000000000005',
    4
  ),
  (
    '40000000-0000-0000-0000-000000000006',
    '20000000-0000-0000-0000-000000000005',
    0,
    'Seal twelve cable-tray service openings',
    '30000000-0000-0000-0000-000000000002',
    12
  ),
  (
    '40000000-0000-0000-0000-000000000007',
    '20000000-0000-0000-0000-000000000005',
    1,
    'Provide accessory for remaining cable-tray opening',
    null,
    null
  ),
  (
    '40000000-0000-0000-0000-000000000008',
    '20000000-0000-0000-0000-000000000006',
    0,
    'Complete fire stopping to ceiling PVC pipe penetration',
    null,
    null
  ),
  (
    '40000000-0000-0000-0000-000000000009',
    '20000000-0000-0000-0000-000000000007',
    0,
    'Seal insulated copper-pipe penetrations',
    '30000000-0000-0000-0000-000000000002',
    null
  ),
  (
    '40000000-0000-0000-0000-000000000010',
    '20000000-0000-0000-0000-000000000008',
    0,
    'Install firestop pillows to cable bundle opening',
    '30000000-0000-0000-0000-000000000006',
    3
  );

insert into public.inventory_snapshots (
  id,
  product_id,
  available_quantity,
  captured_at
)
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
    '50000000-0000-0000-0000-000000000004',
    '30000000-0000-0000-0000-000000000003',
    10,
    '2026-10-01T22:00:00Z'
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
