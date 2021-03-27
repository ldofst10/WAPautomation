const fs = require('fs');

const memListFile = process.argv[2] || '';
const surveyLogFile = process.argv[3] || '';

if(memListFile.substr(memListFile.length-4) !=='.txt'||surveyLogFile.substr(surveyLogFile.length-4)!=='.txt') {
    help();
    process.exit();
}

let data, memList;
try {
    // 로그 1행 = data 배열 한 칸
    data = fs.readFileSync(surveyLogFile).toString().replace(/ /g, '').replace(/\r/g, '').split('\n');
    memList = fs.readFileSync(memListFile).toString().split('\r\n'); // 멤버 리스트 배열
} catch (e) {
    console.log('!! 파일 에러 !!');
    process.exit();
}
    let toWrite = []; // 최종 데이터
    let propList = []; // 주제, 언어, 엔진 등 조사 속성명 리스트
    
    for(const idx in memList) {
        toWrite.push({'name': memList[idx]});
        toWrite[toWrite.length-1].info = {};
    }

    let curLog;
    for(const idx in data) {
        if(data[idx].indexOf('—') !== -1) { // 로그 이름 행일 경우
            curLog = memList.indexOf(data[idx].split('—')[0]);
            if (curLog === -1) {
                console.log('!! 로그', idx*1 + 1,'행에 명부에 없는 이름 !!'); 
                process.exit();
            }
        }
        else { // 프로젝트 정보 행일 경우
            if(data[idx].substr(data[idx].length-1) === '/') {
                data[idx] = data[idx].substr(0, data[idx].length-1);
            } // 양식 마지막에 슬래쉬 붙었을 경우 잘라냄
            let information = data[idx].split('/').map(v => {
                if (v.indexOf(':') === -1) { // 양식에 : 없는 에러
                    console.log('!! 로그', idx*1 + 1,'행에 콜론이 없음 !!');
                    process.exit();
                } else
                    return v;
            }).map(v => v.split(':',2)); // /로 나뉜걸 다시 :로 나누는데 첫번째 : 기준으로 양쪽만 나눔.

            let tmpObj = {};
            for(const inf in information) {
                if(propList.indexOf(information[inf][0])===-1){
                    propList.push(information[inf][0]); // 새로운 조사 속성명일 경우 속성명 리스트에 저장
                } 
                tmpObj[information[inf][0]] = information[inf][1]; // { 속성명 : 속성 }
            }
            for(const inf in tmpObj) {
                if(toWrite[curLog].info[inf] !== undefined){ // 중복 속성의 경우 , 로 붙임 
                    toWrite[curLog].info[inf] += (', '+ tmpObj[inf]);
                } else {
                    toWrite[curLog].info[inf] = tmpObj[inf];
                }
            }
        }
    }
    let str1 = '이름\t';
    for(const title in propList) {
        str1 += propList[title]+'\t';
    }
    let str2 = '';
    for(const idx in toWrite) {
        str2 += toWrite[idx].name + '\t';
            for(const tle in propList) {
                if(toWrite[idx].info[propList[tle]]!=undefined)
                    str2 += toWrite[idx].info[propList[tle]];
                str2 += '\t';
            }
        str2 += '\n';
    }
    fs.writeFileSync(surveyLogFile.substr(0, surveyLogFile.length-4) + 'Parsed.txt', str1 + '\n' + str2 );
    console.log(surveyLogFile + 'Parsed.txt 테이블 출력 완료, Excel에 복붙하시오.');

    function help() {
        console.log(`
WAP Discord Survey Parser (1.0.0)
사용법 :
1. 회원 명단에서 이름 정보 1'열'만 복사하여 .txt 파일에 저장한다.
e.g. list.txt 
홍길동
에드시런
루이스카팔디
2. 디스코드 수요조사 채팅 로그를 마우스로 끌어 복사하여 .txt 파일에 저장한다.
e.g. 디스코드 채팅 로그를 복붙하면 다음과 같은 형태를 띈다. 조사 양식도 예시와 같이 하도록 한다.
이정훈 — 어제 오후 9:33
주제 : 앱(데스크톱)/언어 : c++
주제 : 웹(백엔드)/언어 : c++, Python
--------------------------------------------------------
3. 이 스크립트 파일과 명단, 로그 파일을 같은 디렉토리에 배치한다.
4. 커맨드 창에 node wdsp list.txt log.txt 와 같이 명단, 로그 파일을입력한다.
5. logParsed.txt 파일에 테이블이 생성된다. 명단 파일의 이름 순서대로 생성되므로 그대로 회원 명단 우측에 붙여넣으면 참여자 정보와 불참자를 확인할 수 있다.
<< 주 의 사 항 >>
- 일부 에러 발생 시 해당 라인을 알려주니 수정하고 재실행
- 명단과 로그 이름이 맞아야하며, 동명이인의 경우 추가 문자열 미리 붙여 구분`);
    }