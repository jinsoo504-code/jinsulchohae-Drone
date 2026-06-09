const fs = require("fs");
const os = require("os");
const { execSync } = require("child_process");

function hasCommand(command) {
  try {
    execSync(`${command} --version`, { stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
}

function getLanAddresses() {
  return Object.entries(os.networkInterfaces())
    .flatMap(([name, entries]) =>
      (entries ?? [])
        .filter((entry) => entry.family === "IPv4" && !entry.internal)
        .map((entry) => `${name}: ${entry.address}`)
    );
}

const lanAddresses = getLanAddresses();
const hasEnv = fs.existsSync(".env");
const hasEnvExample = fs.existsSync(".env.example");
const adbAvailable = hasCommand("adb");

console.log("드론방제앱 갤럭시 실행 사전점검");
console.log("");
console.log(`LAN 주소: ${lanAddresses.length > 0 ? "확인됨" : "확인 필요"}`);

if (lanAddresses.length > 0) {
  lanAddresses.forEach((address) => console.log(`- ${address}`));
} else {
  console.log("- PC가 Wi-Fi 또는 LAN에 연결되어 있는지 확인하세요.");
}

console.log("");
console.log(`.env 파일: ${hasEnv ? "있음" : "없음"}`);

if (!hasEnv && hasEnvExample) {
  console.log("- Supabase 실제 연결 전이면 샘플 모드로 실행 가능합니다.");
  console.log("- 실제 연결 테스트 전에는 .env.example을 복사해 .env를 만드세요.");
}

console.log("");
console.log(`adb 명령: ${adbAvailable ? "감지됨" : "감지 안 됨"}`);

if (!adbAvailable) {
  console.log("- USB Android 실행보다 Expo Go QR 실행을 우선하세요.");
}

console.log("");
console.log("기본 실행 명령:");
console.log("npm run start:galaxy");
console.log("");
console.log("LAN QR 연결이 안 될 때 대안:");
console.log("npm run start:galaxy:tunnel");
