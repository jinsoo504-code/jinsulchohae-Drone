import { FieldWithRelations } from "@/src/types/domain";

export const sampleFields: FieldWithRelations[] = [
  {
    field: {
      id: "field-1",
      farmer_id: "farmer-1",
      field_name: "진설농가 A필지",
      address: "전남 고흥군 도양읍 예시리 101",
      center_lat: 34.6118,
      center_lng: 127.2857,
      polygon_geojson: {
        type: "Polygon",
        coordinates: [
          [
            [127.2852, 34.6122],
            [127.2861, 34.6123],
            [127.2862, 34.6115],
            [127.2854, 34.6114],
            [127.2852, 34.6122]
          ]
        ]
      },
      area_size: 1520,
      crop_name: "벼",
      memo: "배수로 주의",
      created_at: new Date().toISOString()
    },
    farmer: {
      id: "farmer-1",
      name: "김농부",
      phone: "010-1111-2222",
      address: "전남 고흥군 도양읍",
      memo: null,
      created_at: new Date().toISOString()
    },
    job: {
      id: "job-1",
      field_id: "field-1",
      farmer_id: "farmer-1",
      assigned_team_id: "team-1",
      scheduled_date: new Date().toISOString().slice(0, 10),
      status: "pending",
      started_at: null,
      completed_at: null,
      memo: null,
      created_at: new Date().toISOString()
    },
    team: {
      id: "team-1",
      team_name: "1팀",
      manager_name: "박팀장",
      phone: "010-1234-5678",
      created_at: new Date().toISOString()
    },
    photos: []
  },
  {
    field: {
      id: "field-2",
      farmer_id: "farmer-2",
      field_name: "해풍농장 2구역",
      address: "전남 고흥군 점암면 예시리 55",
      center_lat: 34.5872,
      center_lng: 127.3141,
      polygon_geojson: {
        type: "Polygon",
        coordinates: [
          [
            [127.3136, 34.5876],
            [127.3146, 34.5877],
            [127.3147, 34.5869],
            [127.3138, 34.5868],
            [127.3136, 34.5876]
          ]
        ]
      },
      area_size: 940,
      crop_name: "마늘",
      memo: null,
      created_at: new Date().toISOString()
    },
    farmer: {
      id: "farmer-2",
      name: "이농장",
      phone: "010-3333-4444",
      address: "전남 고흥군 점암면",
      memo: null,
      created_at: new Date().toISOString()
    },
    job: {
      id: "job-2",
      field_id: "field-2",
      farmer_id: "farmer-2",
      assigned_team_id: "team-2",
      scheduled_date: new Date().toISOString().slice(0, 10),
      status: "in_progress",
      started_at: new Date().toISOString(),
      completed_at: null,
      memo: null,
      created_at: new Date().toISOString()
    },
    team: {
      id: "team-2",
      team_name: "2팀",
      manager_name: "최팀장",
      phone: "010-5555-6666",
      created_at: new Date().toISOString()
    },
    photos: []
  }
];
