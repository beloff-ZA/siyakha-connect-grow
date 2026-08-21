-- Complete planning BOQ for 353 Anton Lembede Street (idempotent)

CREATE UNIQUE INDEX IF NOT EXISTS portal_boq_items_boq_item_code_key
  ON public.portal_boq_items (boq_id, item_code);

CREATE UNIQUE INDEX IF NOT EXISTS portal_boq_sections_boq_title_key
  ON public.portal_boq_sections (boq_id, title);

DO $$
DECLARE
  v_boq uuid := 'd1a11e00-0000-4000-8000-0000000000b1';
  v_proj uuid := 'c1a11e00-0000-4000-8000-0000000000a1';
  v_ap_base int;
  v_ap_roof int;
  v_cam int;
  v_cam_roof int;
  v_routes int;
  v_racks int;
  v_points int;
  r record;
  v_section uuid;
  v_order int;
BEGIN
  SELECT count(*) INTO v_ap_base FROM portal_floor_markers m JOIN portal_floors f ON f.id = m.floor_id
    WHERE m.project_id = v_proj AND m.marker_type = 'wifi_ap' AND f.level_number BETWEEN 0 AND 10;
  SELECT count(*) INTO v_ap_roof FROM portal_floor_markers m JOIN portal_floors f ON f.id = m.floor_id
    WHERE m.project_id = v_proj AND m.marker_type = 'wifi_ap' AND f.level_number = 11;
  SELECT count(*) INTO v_cam FROM portal_floor_markers WHERE project_id = v_proj AND marker_type = 'camera';
  SELECT count(*) INTO v_cam_roof FROM portal_floor_markers m JOIN portal_floors f ON f.id = m.floor_id
    WHERE m.project_id = v_proj AND m.marker_type = 'camera' AND f.level_number = 11;
  SELECT count(*) INTO v_routes FROM portal_cable_routes WHERE project_id = v_proj;
  SELECT count(*) INTO v_racks FROM portal_floor_markers WHERE project_id = v_proj AND marker_type = 'rack';
  v_points := v_ap_base + v_cam;

  UPDATE portal_boqs SET
    title = '353 Anton Lembede Street – Complete Infrastructure BOQ',
    revision_label = 'Planning BOQ v2 – Device & Infrastructure Schedule',
    status = 'shared',
    published_at = COALESCE(published_at, now()),
    currency = 'ZAR',
    vat_enabled = true,
    vat_rate = 15,
    notes = 'Planning quantity schedule only. Commercial rates are pending final RF, riser and CCTV validation plus supplier confirmation — all rates shown as TBC. Launch target 1 November 2026. Current floor-plan quantities (Wi-Fi access points, CCTV cameras, racks and cable routes) are tracked live from the project floor plans and may change as the design is confirmed on site.',
    updated_at = now()
  WHERE id = v_boq;

  -- Sections
  FOR r IN SELECT * FROM (VALUES
    (1, 'Preliminaries & Professional Services', 'Surveys, validation, management, compliance and installation labour.'),
    (2, 'Containment & Copper Cabling', 'Cat6 structured cabling, containment, terminations and labelling.'),
    (3, 'Fibre Backbone', 'OS2 riser backbone from Levels 1-10 access racks to the ground aggregation switch.'),
    (4, 'Racks, Power & Passive Fitout', '6U wall racks with power, ventilation, earthing and accessory provision.'),
    (5, 'Active Network Equipment', 'Switching, gateway, management and configuration.'),
    (6, 'Wireless Network', 'Enterprise Wi-Fi 6 coverage, mounting and RF validation.'),
    (7, 'CCTV & Recording', 'IP surveillance devices, recording platform, storage and configuration.'),
    (8, 'Siyakha Connect Digital Project Tools', 'Secure client portal modules delivered with the project.'),
    (9, 'Testing, Commissioning & Handover', 'Certification, validation, as-builts, training and warranty.')
  ) AS t(so, title, descr) LOOP
    INSERT INTO portal_boq_sections (boq_id, title, description, sort_order)
    VALUES (v_boq, r.title, r.descr, r.so)
    ON CONFLICT (boq_id, title) DO UPDATE SET description = EXCLUDED.description, sort_order = EXCLUDED.sort_order;
  END LOOP;

  -- Remove legacy empty placeholder sections
  DELETE FROM portal_boq_sections s
   WHERE s.boq_id = v_boq
     AND s.title IN ('Preliminaries & General','Containment & Cable Infrastructure','Network Equipment',
                     'Wireless Coverage','Surveillance & Access Control','Testing, Certification & Handover')
     AND NOT EXISTS (SELECT 1 FROM portal_boq_items i WHERE i.section_id = s.id);

  -- Items
  v_order := 0;
  FOR r IN SELECT * FROM (VALUES
    (1,'PG-001','Measured building, riser and site survey','Measured verification of all 12 levels, riser paths, ceiling voids, containment routes and rack positions.','lot',1,true,'Confirms final quantities and containment measurement.'),
    (1,'PG-002','Predictive and onsite Wi-Fi RF survey and validation','Predictive model per level plus onsite validation survey to confirm access point count, placement and model mix.','lot',1,true,'Determines final GWN7660E / GWN7664E mix.'),
    (1,'PG-003','CCTV field-of-view, privacy and mounting validation','Per-camera FOV, lens, mounting height and privacy-zone confirmation against the placement plan.','lot',1,true,'Confirms final dome / bullet / PTZ and lens selection.'),
    (1,'PG-004','Project management and programme control','Dedicated project manager, programme, progress reporting and coordination with other trades.','lot',1,true,'Aligned to 1 November 2026 launch target.'),
    (1,'PG-005','Health & safety file, method statements and compliance','Site-specific H&S file, risk assessments, method statements, inductions and working-at-height compliance.','lot',1,true,'Required before site access.'),
    (1,'PG-006','Installation labour','Planning basis: 4 installation engineers plus 1 team lead, 10 working days at 8 hours per day.','hour',400,true,'Rate TBC. Quantity is a planning allowance, subject to measured survey.'),
    (1,'PG-007','Local travel, delivery and site logistics','Local travel, vehicle, deliveries and on-site logistics for the installation programme.','lot',1,true,'Prior budgetary allowance reference R7,500 excl VAT - not priced here pending approval.'),
    (1,'PG-008','Procurement, staging, serial capture and delivery coordination','Supplier procurement, pre-staging, configuration, serial-number capture and delivery coordination to site.','lot',1,true,'Supports the warranty and asset register handover pack.'),

    (2,'CAB-001','Cat6 UTP cable','Solid-copper Cat6 U/UTP supplied on 500m drums; 15 drums = 7,500m budgetary design allowance.','drum',15,true,'7,500m total design allowance. Final quantity confirmed by measured survey.'),
    (2,'CAB-002','Cat6 data/PoE home-runs for routed Level 0-10 devices','Individual home-run from each Wi-Fi access point and CCTV camera on Levels 0-10 to that level''s 6U rack.','each',NULL,true,'Quantity derived live from mapped cable routes on Levels 0-10.'),
    (2,'CAB-003','Rooftop CCTV home-runs','Rooftop camera cabling to the confirmed home rack via the building riser.','each',NULL,true,'Final home rack and riser path TBC - rooftop routing pending final route validation.'),
    (2,'CAB-004','Provisional rooftop AP home-run','Cabling for the provisional rooftop access point.','each',NULL,false,'Provisional / excluded pending rooftop scope and riser confirmation.'),
    (2,'CAB-005','24-port Cat6 rack patch panels','1U 24-port Cat6 patch panel with rear management bar, one per rack.','each',NULL,true,'One per 6U rack on Levels 0-10.'),
    (2,'CAB-006','Cat6 keystone / field-termination modules for included device points','Cat6 keystone jacks or field-termination plugs for the device end of each included point.','each',NULL,true,'Base 100 access points plus current live camera total.'),
    (2,'CAB-007','Cat6 rack patch leads for included device points','Factory-terminated Cat6 patch leads, panel to switch port.','each',NULL,true,'Base 100 access points plus current live camera total.'),
    (2,'CAB-008','Horizontal rack cable managers','1U horizontal cable management with front fingers, one per rack.','each',NULL,true,'One per 6U rack on Levels 0-10.'),
    (2,'CAB-009','Cable basket, trunking, conduit and containment','Wire basket, trunking, conduit, brackets and supports for horizontal and riser containment.','sum',1,true,'Provisional sum - measured length TBC after building survey.'),
    (2,'CAB-010','Penetrations, sleeves and compliant fire-stopping','Core drilling, sleeving and rated fire-stopping of all floor and wall penetrations.','lot',1,true,'Quantity confirmed after riser survey.'),
    (2,'CAB-011','Velcro, saddles, fixings and installation consumables','Hook-and-loop ties, saddles, anchors, screws and general installation consumables.','lot',1,true,'Allowance.'),
    (2,'CAB-012','Permanent machine-printed cable and port labels','Machine-printed permanent labels at both ends of every link plus rack, panel and port labelling.','lot',1,true,'Feeds the labelling schedule at handover.'),

    (3,'FIB-001','40-core OS2 single-mode fibre backbone','40-core OS2 single-mode riser fibre from Levels 1-10 access racks to the ground-floor aggregation rack.','m',500,true,'Budgetary design allowance - measured riser length TBC.'),
    (3,'FIB-002','Rack fibre LIU / ODF termination enclosures','Rack-mount fibre optical distribution unit with splice tray and adapter plate.','each',NULL,true,'One per rack on Levels 0-10.'),
    (3,'FIB-003','10G SFP+ LR OS2 optical transceivers','Compatible 10GBASE-LR SFP+ single-mode transceivers, two per uplink (rack end and aggregation end).','each',20,true,'10 planned uplinks x 2 ends. Compatibility to be confirmed against GWN7813P / GWN7832.'),
    (3,'FIB-004','OS2 LC-LC fibre patch leads','Single-mode duplex LC-LC patch leads, rack and aggregation ends.','each',20,true,'Two per uplink.'),
    (3,'FIB-005','Pigtails, adapters, splice cassettes and fibre consumables','Pigtails, adapters, splice protection sleeves, cassettes and fibre consumables.','lot',1,true,'Allowance.'),
    (3,'FIB-006','Fusion splicing and termination','Fusion splicing, termination and tray dressing at each link end.','each',20,true,'20 link ends across 10 planned uplinks.'),
    (3,'FIB-007','OTDR and optical-loss testing','Bi-directional optical loss testing and OTDR traces per uplink with results pack.','each',10,true,'One test set per planned uplink.'),
    (3,'FIB-008','Riser containment, support and fibre protection','Riser containment, cleats, supports and mechanical protection for the fibre backbone.','lot',1,true,'Route and length TBC after riser survey.'),

    (4,'RACK-001','6U wall-mount network rack','6U lockable wall-mount rack with vented door, cable entries and fixings.','each',NULL,true,'One per level, Levels 0-10.'),
    (4,'RACK-002','Rack power distribution unit','Rack-mount PDU with surge protection and SA-standard outlets.','each',NULL,true,'One per rack.'),
    (4,'RACK-003','Rack ventilation / fan provision','Thermostat or fixed fan set for enclosed rack ventilation.','each',NULL,true,'One per rack.'),
    (4,'RACK-004','Rack earthing and bonding kit','Earth bar, bonding straps and conductor to building earth.','each',NULL,true,'One per rack.'),
    (4,'RACK-005','Cage nuts, shelves, fixings and installation accessory set','Cage nuts, bolts, shelf and general rack accessory set.','set',NULL,true,'One set per rack.'),
    (4,'RACK-006','Dedicated protected electrical outlet / isolator per rack','Dedicated protected circuit, outlet and local isolator at each rack position.','each',NULL,true,'Electrical trade scope and availability TBC - coordinate with the building electrical contractor.'),
    (4,'RACK-007','Rack UPS / power-resilience allowance','Rack or wall-mount UPS to maintain switching and cameras through short outages.','each',NULL,false,'Provisional / excluded. Model and runtime TBC after load and runtime requirement is set.'),
    (4,'RACK-008','Rack capacity note - 6U utilisation','Active electronics currently occupy 2U at Level 0 (access plus aggregation switch) and 1U on Levels 1-10. Remaining U is shared by patch panel, fibre LIU and cable management.','lot',1,true,'The ground-floor recording head-end is NOT confirmed as fitting the remaining 6U capacity. If the final recorder and storage exceed the free U, a separate floor-standing or larger ground-floor cabinet must be added by variation.'),

    (5,'NET-001','Grandstream GWN7813P managed PoE switch','24-port Layer 3 managed PoE switch, 1U, with SFP+ uplinks. One per rack, Levels 0-10.','each',NULL,true,'Confirmed and already recorded in the project rack equipment schedule.'),
    (5,'NET-002','Grandstream GWN7832 fibre aggregation switch','Layer 3 aggregation switch, 12 x 10G SFP+, 1U. Level 0 rack only.','each',1,true,'10 planned fibre uplinks with 2 spare SFP+ ports. Confirmed in the rack equipment schedule.'),
    (5,'NET-003','Core firewall / router / gateway','Perimeter firewall and routing platform with content filtering, VPN and guest isolation.','each',1,true,'Make and model TBC after WAN, throughput and security requirements are confirmed.'),
    (5,'NET-004','WAN / ISP service handoff','Fibre or wireless WAN service delivered to the ground-floor rack.','service',1,false,'Client / ISP supplied. Excluded unless separately quoted by Siyakha.'),
    (5,'NET-005','Central switch and AP cloud management and monitoring setup','Cloud controller tenancy, device adoption, alerting and monitoring dashboards.','lot',1,true,'Includes handover of administrative access to the client.'),
    (5,'NET-006','VLAN, QoS, PoE, management and network-security configuration','Segmentation for management, Wi-Fi, guest and CCTV, QoS, PoE budgets and hardening.','lot',1,true,'Design confirmed with the client before implementation.'),
    (5,'NET-007','Firmware standardisation, configuration backup and asset register','Standardised firmware baseline, saved configuration backups and a full asset / serial register.','lot',1,true,'Delivered in the handover pack.'),

    (6,'WIFI-001','Grandstream enterprise Wi-Fi 6 indoor access point','Wi-Fi 6 dual-band enterprise indoor access point, PoE powered, cloud managed. Proposed GWN7660E.','each',100,true,'Approved base quantity of 100 access points on Levels 1-10. Final GWN7660E / GWN7664E mix after RF validation.'),
    (6,'WIFI-002','Rooftop / outdoor access point','Weather-rated outdoor access point for rooftop and service-level coverage.','each',NULL,false,'Provisional / excluded rooftop variance to the approved 100 access points. Weather-rated model TBC.'),
    (6,'WIFI-003','Indoor AP mounting plates and fixings','Ceiling or wall mounting plate, backing box and fixings per indoor access point.','each',100,true,'Matches the 100 approved indoor access points.'),
    (6,'WIFI-004','Rooftop AP weatherproof mounting and surge accessories','Weatherproof enclosure, pole or wall bracket, gland set and surge protection.','set',NULL,false,'Excluded / provisional with the rooftop access point variance.'),
    (6,'WIFI-005','SSID, VLAN, roaming, captive portal and access-policy configuration','SSID design, VLAN mapping, fast roaming, band steering, captive portal and per-role access policy.','lot',1,true,'Guest and resident policies to be confirmed with building management.'),
    (6,'WIFI-006','Post-installation RF validation and coverage heatmap','Post-installation survey with per-level heatmaps, throughput and roaming results.','lot',1,true,'Issued as part of the handover pack.'),

    (7,'CCTV-001','Hikvision 4MP PoE IP CCTV cameras','4MP IP cameras, PoE powered, IR night view, NVR recorded.','each',NULL,true,'Quantity derived live from placed camera markers. Final dome / bullet / PTZ and lens mix per position after FOV validation.'),
    (7,'CCTV-002','Camera junction boxes, mounting bases and fixings','Junction box, mounting base, gland and fixings per camera position.','each',NULL,true,'Matches the live camera total.'),
    (7,'CCTV-003','Rooftop weatherproof mounting and surge-protection sets','Weatherproof housing or enclosure, bracket and surge protection for exposed rooftop positions.','set',NULL,true,'Derived from the live rooftop camera count.'),
    (7,'CCTV-004','Recording platform (NVR)','Network video recorder platform sized above the live camera count with PoE or non-PoE channels as required.','system',1,true,'WARNING: a single 64-channel NVR is insufficient because the live camera count exceeds 64. Exact NVR model and quantity TBC - a multi-recorder or higher-channel architecture is required.'),
    (7,'CCTV-005','Surveillance-grade recording storage','Surveillance-rated hard drives or storage array for the recording platform.','system',1,true,'Capacity TBC after resolution, frame-rate and retention calculation. Previous 8TB / 16TB references are NOT final for the current camera count.'),
    (7,'CCTV-006','CCTV operator workstation, display and controls','Operator PC, monitor or video wall, keyboard controller and client software.','set',1,false,'Provisional / excluded pending the operational monitoring requirement.'),
    (7,'CCTV-007','Camera configuration, naming, aiming, focus and verification','Per-camera addressing, naming, aiming, focus, exposure and recording verification.','each',NULL,true,'Matches the live camera total.'),
    (7,'CCTV-008','Recording, analytics, privacy-mask, user-role and alert configuration','Recording schedules, motion and analytics rules, privacy masks, user roles and alerting.','lot',1,true,'Privacy masking per POPIA obligations.'),
    (7,'CCTV-009','Statutory and privacy CCTV signage','Compliant CCTV notice signage at monitored entrances and common areas.','lot',1,true,'Required for POPIA compliance.'),

    (8,'PORTAL-001','Secure E. Ally client sign-in and project access','Authenticated portal access scoped to the assigned project only, with row-level security.','each',1,true,'Included in the Siyakha Connect delivery.'),
    (8,'PORTAL-002','Project planner, milestones and 1 Nov 2026 countdown','Phases, milestones, tasks and a live countdown to the 1 November 2026 launch target.','module',1,true,'Live in the portal.'),
    (8,'PORTAL-003','BOQ review, line queries, revision and acceptance workflow','Line-level queries, admin responses, revision history and recorded acceptance or change requests.','module',1,true,'Live in the portal.'),
    (8,'PORTAL-004','Interactive 12-level floor plans and saved AP/CCTV/rack markers','Pan and zoom architectural plans with saved, draggable device and rack markers per level.','module',1,true,'Live in the portal.'),
    (8,'PORTAL-005','Wi-Fi coverage, camera direction and cable-route overlays','Coverage indication, camera direction and field-of-view, and editable cable-route overlays.','module',1,true,'Live in the portal.'),
    (8,'PORTAL-006','Device, rack equipment and cable-route schedules with CSV export','Filterable schedules for devices, rack equipment and cable routes with CSV export.','module',1,true,'Live in the portal.'),
    (8,'PORTAL-007','Project documents, drawings and site gallery','Private document library for approved and submission drawings plus the site photo gallery.','module',1,true,'Live in the portal.'),
    (8,'PORTAL-008','Audit trail and implementation progress tracking','Append-only activity history for BOQ, markers and routes plus progress tracking.','module',1,true,'Live in the portal.'),

    (9,'TEST-001','Cat6 permanent-link certification','Permanent-link certification of every installed copper point with saved test results.','each',NULL,true,'Base 100 access points plus current live camera total.'),
    (9,'TEST-002','PoE delivery and switch-port validation','Confirmation of PoE class negotiation, delivered power and port configuration per device.','each',NULL,true,'Base 100 access points plus current live camera total.'),
    (9,'TEST-003','Wi-Fi AP adoption, roaming and performance validation','Adoption, channel plan, roaming and throughput validation per access point.','each',100,true,'Matches the 100 approved access points.'),
    (9,'TEST-004','CCTV image, angle, night-view and recording verification','Daylight and night-view image checks, angle confirmation and recording verification per camera.','each',NULL,true,'Matches the live camera total.'),
    (9,'TEST-005','End-to-end fibre uplink testing','End-to-end link validation of each fibre uplink at operating speed.','each',10,true,'One per planned uplink.'),
    (9,'TEST-006','Rack, port, AP and camera labelling schedule','Consolidated labelling schedule cross-referencing rack, panel port, device label and location.','lot',1,true,'Issued with the as-builts.'),
    (9,'TEST-007','As-built floor plans, cable routes and equipment schedule','As-built drawings per level with final device positions, cable routes and rack equipment.','floor',12,true,'All 12 levels including the rooftop / service level.'),
    (9,'TEST-008','Client administrator training and handover','Structured training for the client administrators on network, Wi-Fi, CCTV and portal tools.','session',1,true,'Scheduled at practical completion.'),
    (9,'TEST-009','Warranty, serial-number and test-result handover pack','Compiled warranty certificates, serial register, configurations and all test results.','lot',1,true,'Digital and printed copies.'),
    (9,'TEST-010','Two-year workmanship and equipment warranty coordination','Two-year workmanship warranty with coordination of manufacturer equipment warranties and RMAs.','lot',1,true,'Subject to manufacturer terms and conditions.')
  ) AS t(sec, code, descr, spec, unit, qty, included, note) LOOP
    SELECT id INTO v_section FROM portal_boq_sections WHERE boq_id = v_boq AND sort_order = r.sec LIMIT 1;
    v_order := v_order + 1;

    INSERT INTO portal_boq_items
      (boq_id, section_id, item_code, description, specification, quantity, unit,
       customer_unit_rate, vat_applicable, is_included, notes, reference, sort_order)
    VALUES (v_boq, v_section, r.code, r.descr, r.spec,
      COALESCE(r.qty, CASE r.code
        WHEN 'CAB-002' THEN v_routes
        WHEN 'CAB-003' THEN v_cam_roof
        WHEN 'CAB-004' THEN v_ap_roof
        WHEN 'CAB-005' THEN v_racks
        WHEN 'CAB-006' THEN v_points
        WHEN 'CAB-007' THEN v_points
        WHEN 'CAB-008' THEN v_racks
        WHEN 'FIB-002' THEN v_racks
        WHEN 'RACK-001' THEN v_racks
        WHEN 'RACK-002' THEN v_racks
        WHEN 'RACK-003' THEN v_racks
        WHEN 'RACK-004' THEN v_racks
        WHEN 'RACK-005' THEN v_racks
        WHEN 'RACK-006' THEN v_racks
        WHEN 'RACK-007' THEN v_racks
        WHEN 'NET-001' THEN v_racks
        WHEN 'WIFI-002' THEN v_ap_roof
        WHEN 'WIFI-004' THEN v_ap_roof
        WHEN 'CCTV-001' THEN v_cam
        WHEN 'CCTV-002' THEN v_cam
        WHEN 'CCTV-003' THEN v_cam_roof
        WHEN 'CCTV-007' THEN v_cam
        WHEN 'TEST-001' THEN v_points
        WHEN 'TEST-002' THEN v_points
        WHEN 'TEST-004' THEN v_cam
        ELSE 1 END),
      r.unit, 0, true, r.included, r.note, NULL, v_order)
    ON CONFLICT (boq_id, item_code) DO UPDATE SET
      section_id = EXCLUDED.section_id,
      description = EXCLUDED.description,
      specification = EXCLUDED.specification,
      quantity = EXCLUDED.quantity,
      unit = EXCLUDED.unit,
      is_included = EXCLUDED.is_included,
      notes = EXCLUDED.notes,
      sort_order = EXCLUDED.sort_order,
      updated_at = now()
    WHERE portal_boq_items.customer_unit_rate = 0;
  END LOOP;

  INSERT INTO portal_boq_activity (boq_id, actor_type, action, detail)
  VALUES (v_boq, 'admin', 'boq_seeded',
    format('Planning BOQ v2 seeded: %s base APs, %s rooftop AP, %s cameras, %s racks, %s routes', v_ap_base, v_ap_roof, v_cam, v_racks, v_routes));
END $$;