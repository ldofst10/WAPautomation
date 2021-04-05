#include <stdio.h>
#include <stdlib.h> //atoi를 사용하려면 있어야함
#include <string.h> // memset 등
#include <unistd.h> //sockaddr_in, read, write 등
#include <arpa/inet.h>  //htnol, htons, INADDR_ANY, sockaddr_in 등
#include <sys/socket.h>
void error_handling(char * message);

int main( )
{    
    int serv_sock;
    int clnt_sock;
   
    //sockaddr_in은 소켓 주소의 틀을 형셩해주는 구조체로 AF_INET일 경우 사용
    struct sockaddr_in serv_addr;
    struct sockaddr_in clnt_addr; //accept함수에서 사용됨.
    socklen_t clnt_addr_size;
   
    //TCP연결지향형이고 ipv4 도메인을 위한 소켓을 생성
    serv_sock=socket(PF_INET, SOCK_STREAM, 0); 
    if(serv_sock == -1)
         error_handling("socket error");
    
    //주소를 초기화한 후 IP주소와 포트 지정
    memset(&serv_addr, 0, sizeof(serv_addr)); 
    serv_addr.sin_family=AF_INET;                //타입: ipv4
    serv_addr.sin_addr.s_addr=htonl(INADDR_ANY); //ip주소
    serv_addr.sin_port=htons(9230);     //port
    
    //소켓과 서버 주소를 바인딩
    if(bind(serv_sock, (struct sockaddr*) &serv_addr, sizeof(serv_addr))==-1)
    	error_handling("bind error");
    
    //연결 대기열 5개 생성 
    if(listen(serv_sock, 5)==-1)
    	error_handling("listen error");
    
    //클라이언트로부터 요청이 오면 연결 수락
    clnt_addr_size = sizeof(clnt_addr);
    clnt_sock=accept(serv_sock, (struct sockaddr*)&clnt_addr, &clnt_addr_size);
    if(clnt_sock==-1)
        error_handling("accept error");
       

//   if(read(clnt_sock, message, sizeof(message)-1) == -1)
 //               error_handling("read error");

    char expr[100] = {0,};
   if(read(clnt_sock, expr, sizeof(expr)-1) == -1)
               error_handling("read error");
   printf("%s = ",expr);

	char op1_c[50] = {0,};
     	int op1_cnt = 0;
	char op = '\0';
	char op2_c[50] = {0,};
	int op2_cnt = 0;	
   for(int i = 0; i < 100; i++) {
	   if(i == 99) 
		error_handling("no null error");
	switch(expr[i]) {
		case '1':
		case '2':
		case '3':
		case '4':
		case '5':
		case '6':
		case '7':
		case '8':
		case '9':
		case '0':
			if(op=='\0'){
				op1_c[op1_cnt++] = expr[i];
				op1_c[op1_cnt] = '\0';
			} else {
				op2_c[op2_cnt++] = expr[i];
				op2_c[op2_cnt] = '\0';
			}
			break;
		case '+':
		case '-':
		case '*':
		case '/':
		case '%':
			if(op!='\0') 
				error_handling("operator error");
			op = expr[i];
			break;
		case '\0':
			i = 99;
			break;
		default:
			error_handling("invalid character error");
	}
   }

   int op1 = atoi(op1_c);
   int op2 = atoi(op2_c);
   int result;
   switch(op) { 
		case '+':
			result = op1 + op2;
			break;
		case '-':
			result = op1 - op2;
			break;
		case '*':
			result = op1 * op2;
			break;
		case '/':
			result = op1 / op2;
			break;
		case '%':
			result = op1 % op2;
			break;
   }
   printf(" %d \n", result);
    /*-----데이터 전송-----*/  
   write(clnt_sock, &result, sizeof(int));
    
    //소켓들 닫기
    close(clnt_sock);
    close(serv_sock);
    
    return 0;
}
void error_handling(char *message)
{
    fputs(message,stderr);
    fputc('\n', stderr);
    exit(1);
}
