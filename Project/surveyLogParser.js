const fs = require('fs');
const readline = require('readline');

console.log(
`[조사 양식] => 주제: ~ /언어: ~/ ~'
e.g. 다음과 같은 디스코드 채팅 로그가 반복되는 txt 파일
이정훈 — 어제 오후 9:33
주제 : 앱(데스크톱)/언어 : c++
주제 : 웹(백엔드)/언어 : c++, Python
--------------------------------------------------------
확장자를 제외한 txt 파일명을 입력하시오 :`);
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

rl.on('line', (line) => {
    let logFile = line;
    
    let data = fs.readFileSync(logFile + '.txt').toString().replace(/ /g, '').replace(/\r/g, '').split('\n');
    let toWrite = [];
    let columnList = [];
    
    for(const idx in data) {
        if(data[idx].indexOf('—') !== -1) { // 이름 파싱하고 각 객체 생성
            toWrite.push({'name':data[idx].split('—')[0]}).info;
            toWrite[toWrite.length-1].info = [];
        }
        else { // 프로젝트 정보 처리
            if(data[idx].substr(data[idx].length-1) === '/') {
                data[idx] = data[idx].substr(0, data[idx].length-1);
            }
            let information = data[idx].split('/').map(v => {
                if (v.indexOf(':') === -1) {
                    console.log('!! 로그', idx*1 + 1,'번째 줄에 콜론이 없음 !!');
                    rl.close();
                } else
                    return v;
            }).map(v => v.split(':',2));

            let tmpObj = {};
            for(const inf in information) {
                if(columnList.indexOf(information[inf][0])===-1){
                    columnList.push(information[inf][0]);
                }
                tmpObj[information[inf][0]] = information[inf][1];
            }

            toWrite[toWrite.length-1].info.push(tmpObj);
            //toWrite[toWrite.length-1].num = toWrite[toWrite.length-1].info.length;
        }
    }
    let str1 = '이름\t';
    for(const title in columnList) {
        str1 += columnList[title]+'\t';
    }
    let str2 = '';
    for(const idx in toWrite) {
        str2 += toWrite[idx].name + '\t';
        for(const n1 in toWrite[idx].info){
            for(const tle in columnList) {
                if(toWrite[idx].info[n1][columnList[tle]]!=undefined)
                    str2 += toWrite[idx].info[n1][columnList[tle]];
                str2 += '\t';
            }
            if(n1 < toWrite[idx].info.length -1)
                str2 += '\n\t';
        }
        str2 += '\n';
    }
    fs.writeFileSync(logFile + 'Parsed.txt',str1 + '\n' + str2 );
    console.log(logFile + 'Parsed.txt 테이블 출력 완료, Excel에 복붙하시오.');
    rl.close();
}).on('close', () => {
    process.exit();
});
