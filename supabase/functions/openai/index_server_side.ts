// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
// import "https://esm.sh/@supabase/functions-js/src/edge-runtime.d.ts"

// console.log("Hello from Functions!")

// Deno.serve(async (req) => {
//   const { name } = await req.json()
//   const data = {
//     message: `Hello ${name}!`,
//   }

//   return new Response(
//     JSON.stringify(data),
//     { headers: { "Content-Type": "application/json" } },
//   )
// })

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/openai' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'


  * supabase deploy
  supabase functions deploy --no-verify-jwt openai
  * supabase set secrets
  supabase secrets set --env-file ./supabase/.env.local
*/

//! 카톡채널 챗봇용 서비스 코드


import * as postgres from "https://deno.land/x/postgres@v0.19.3/mod.ts"
import OpenAI from "https://deno.land/x/openai@v4.57.0/mod.ts"
import { TextContentBlock } from "https://deno.land/x/openai@v4.57.0/resources/beta/threads/mod.ts";

// Get the connection string from the environment variable "SUPABASE_DB_URL"
const databaseUrl = Deno.env.get('SUPABASE_DB_URL')!

// Create a database pool with three connections that are lazily established
const pool = new postgres.Pool(databaseUrl, 3, true)

type AssistantDb = {
  name:string,
  assistant_id:string,
  kakao_bot_id:string
};

type ThreadDb = {
  thread_id:string,
  assistant_id:string,
  user_id:string,
}

type MessageDb = {
  user_id:string,
  thread_id:string,
  assistant_id:string,
  user_message_id:string,
  user_message:string,
  assistant_message_id:string,
  assistant_message:string,
}

Deno.serve(async (req: Request) => {
  //? 카카오 챗봇에서 전달받은 json을 파싱
  //? supabase db에서 사용자 및 어시스턴트, 스레드 id 조회.
  //? 카카오 서버에는 usecallback 리턴을 날림(마지막)
  //? openai에 대화 내용 던짐.
  //? 받은 내용 db에 저장. callbackUrl로 받은 내용 전송

  //* 카톡 처리 때문에 대부분의 처리는 여기서 비동기로 작업한다.
  getAssistantMessage(req);
  
  //* useCallback 메세지를 카톡 서버에 즉시 전송
  // const webhookText = JSON.stringify(await req.json());
  const webhookText = "잠시만 기다려줄래? 고심해서 답변을 작성중이야.";
  return Response.json(getUseCallbackResponse(webhookText));
})

//* 카톡 useCallback 신호 전송용 응답 개체 생성
const getUseCallbackResponse = (webhookText: string) => {
  const response = {
    version: "2.0",
    useCallback: true,
    data: {
      text: webhookText
    },
  };
  return response;
}

//* 카톡 서버로 보낼 ai 처리 결과 단순텍스트 메세지 결과
const getSimpleTextResponse = (reply: string | null) => {
  const response = {
    version: "2.0",
    template: {
      outputs: [{
          simpleText: {
            text: reply
          }
        }]
    }
  }
  return response;
}

//* 카톡 callbackUrl에 최종 응답 전송
const sendCallbackResponse = async (webhookText: string, callbackUrl: string) => {
  // await new Promise((resolve) => setTimeout(resolve, 5000));
  const response = getSimpleTextResponse(webhookText);
  await fetch(callbackUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(response),
  });
}

const getAssistantMessage = async (req: Request) => {
  //* parse kakaotalk data
  const reqJson = await req.json();
  const utterance = reqJson?.userRequest?.utterance;
  const callbackUrl = reqJson?.userRequest?.callbackUrl;
  const timezone = reqJson?.userRequest?.timezone;
  const lang = reqJson?.userRequest?.lang;
  const botId = reqJson?.bot?.id;
  const botUserKey = reqJson?.userRequest?.user?.properties?.botUserKey;
  const plusfriendUserKey = reqJson?.userRequest?.user?.properties?.plusfriendUserKey;
  const isFriend = reqJson?.userRequest?.user?.properties?.isFriend;

  if (!callbackUrl || !utterance){
    await sendCallbackResponse("카카오톡에서 오류가 발생했어요. 문제를 해결할 때까지 잠시 기다려 주세요", callbackUrl);
    return;
  }

  try {
    const connection = await pool.connect();
    try {
      //* supabase 연결 및 관련된 호출 처리
      //* openai 호출 부분
      // Documentation here: https://github.com/openai/openai-node
      //* 카카오 botId와 연결된 AssistantId를 조회
      const getAsssistantQueryrResult = await connection.queryObject<AssistantDb>(`
        SELECT *
        FROM assistants
        WHERE kakao_bot_id = $1`,
        [botId]);
      const assistant = getAsssistantQueryrResult.rows[0];

      //* AssistantId와 UserId를 통해 ThreadId 조회
      const getThreadQueryResult = await connection.queryObject<ThreadDb>(`
        SELECT *
        FROM threads
        WHERE assistant_id = $1
        AND user_id = $2
        ORDER BY created_at DESC`,
        [assistant.assistant_id, botUserKey]
      );
      const threadInfo = getThreadQueryResult.rows[0];
      const threadId = threadInfo?.thread_id;

      //* 저장된 messages 조회. 하루 10건 이상이면 응답 거부.
      if (threadId){
        const getMessagesQueryResult = await connection.queryObject<{count: number}>(`
            SELECT COUNT(*)
            FROM messages
            WHERE thread_id = $1
            AND created_at >= CURRENT_DATE`,
            [threadId]);

        if (getMessagesQueryResult.rows[0]?.count > 9){
          await sendCallbackResponse("오늘 너무 많은 대화를 한 것 같아. 내일 다시 만나서 이야기하자", callbackUrl);
          return;
        }
      }

      //* openai와 접속해서 스레드 연결 혹은 생성 및 db에 저장
      const openai = new OpenAI({
        apiKey: Deno.env.get('OPENAI_API_KEY'),
      });
      let thread;
      if (threadId) {
        thread = await openai.beta.threads.retrieve(threadId);
      } else {
        thread = await openai.beta.threads.create();
        await connection.queryObject(`
          INSERT INTO threads (thread_id, assistant_id, user_id)
          VALUES ($1, $2, $3)`,
          [thread.id, assistant.assistant_id, botUserKey]);
      }

      //* 새 메세지 객체 생성
      const message = await openai.beta.threads.messages.create(
        thread.id, {
          role: "user",
          content: utterance
        });

      //* 새 답변 생성
      const run = await openai.beta.threads.runs.createAndPoll(
        thread.id, {
          assistant_id: assistant.assistant_id,
        }
      )
      
      //* 확인 후 db 저장 및 카톡 callbackUrl에 답변 전송
      //todo 사용자 메세지와 assistant 메세지 db 저장 구현
      if (run.status === 'completed') {
        const messages = await openai.beta.threads.messages.list(
          run.thread_id, {
            order:'desc',
            // limit:1,
            // after:message.id, 
            // run_id:run.id
          }
        );
        const newMessage = messages.data[0];
        if (newMessage.content[0].type == "text"){
          await connection.queryObject(`
            INSERT INTO messages (user_id, thread_id, assistant_id, user_message_id, user_message, assistant_message_id, assistant_message)
            VALUES ($1, $2, $3, $4, $5, $6, $7)`,
            [
              botUserKey,
              newMessage.thread_id,
              newMessage.assistant_id,
              message.id,
              (message.content[0] as TextContentBlock).text.value,
              newMessage.id,
              (newMessage.content[0] as TextContentBlock).text.value
            ]);
          const newMessageText = (newMessage.content[0] as TextContentBlock).text.value;

          await sendCallbackResponse(newMessageText, callbackUrl);
        }
      } else {
        await sendCallbackResponse(run.status, callbackUrl);
      }
    } finally {
      connection.release();
    }
  } catch (err) {
    await sendCallbackResponse(err.message, callbackUrl);
    //"오류가 발생했어요. 문제를 해결할 때까지 잠시 기다려 주세요"
  }
};


// unused backup
const _getCompletionMessage = (utterance: string, callbackUrl: string) => {
  const openai = new OpenAI({
        apiKey: Deno.env.get('OPENAI_API_KEY'),
      })
  openai.chat.completions.create({
    messages: [{ role: 'user', content: utterance }],
    // Choose model from here: https://platform.openai.com/docs/models
    // model: 'gpt-4o',
    model: 'gpt-3.5-turbo',
    stream: false,
  }).then(async chatCompletion => {
    const reply = chatCompletion.choices[0].message.content;
    const response = getSimpleTextResponse(reply);

    await fetch(callbackUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(response),
    });
  });
}