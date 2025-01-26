
## **1. 사전 준비**
### 필요한 도구
- **Node.js**: VS Code 확장 프로그램은 Node.js 환경에서 동작하므로 설치가 필요합니다.
  - [Node.js 다운로드](https://nodejs.org/)
- **Yeoman** 및 **VS Code Extension Generator**:
  ```bash
  npm install -g yo generator-code
  ```

---

## **2. 확장 프로그램 생성**
1. 터미널에서 명령 실행:
   ```bash
   yo code
   ```
2. 질문에 따라 옵션 선택:
   - **What type of extension do you want to create?**
     - `New Extension (TypeScript)` 선택.
   - **What’s the name of your extension?**
     - 예: `my-package-extension`
   - 나머지는 기본값을 사용하거나 원하는 대로 입력.

3. 생성 완료 후, 프로젝트 폴더가 생성됩니다. 예를 들어:
   ```
   my-package-extension/
   ├── .vscode/
   ├── src/
   │   └── extension.ts  # 주요 코드 파일
   ├── package.json      # 확장의 메타데이터와 설정
   └── tsconfig.json     # TypeScript 설정
   ```

---

## **3. 핵심 코드 작성**
`src/extension.ts` 파일에서 확장의 동작을 정의합니다.
테스트 디버깅을 위해서는 f5를 눌러 디버거를 실행해줍니다.

---

## **4. 확장 패키징 및 배포**
### **패키징**
1. 확장을 패키징하려면 `vsce`(Visual Studio Code Extension Manager)를 설치합니다:
   ```bash
   npm install -g vsce
   ```

2. 프로젝트 디렉터리에서 다음 명령 실행:
   ```bash
   vsce package
   ```
   - `.vsix` 파일이 생성됩니다.

### **배포**
1. **VS Code 확장 마켓플레이스**에 배포하려면:
   - [Visual Studio Code Marketplace](https://marketplace.visualstudio.com/)에 로그인.
   - 확장 개발자 계정을 등록.
   - `.vsix` 파일을 업로드.

2. **로컬 설치**:
   - 생성된 `.vsix` 파일을 설치하려면 VS Code에서 `Ctrl + Shift + P` → "Install from VSIX" 실행.
