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

import OpenAI from "https://deno.land/x/openai/mod.ts"
import { TextContentBlock } from "https://deno.land/x/openai/resources/beta/threads/mod.ts";
import { createClient } from 'jsr:@supabase/supabase-js@2'
import { Database } from '../../database.types.ts';

const limitMessagesPerDay = 30;

Deno.serve(async (req: Request) => {
  //? 카카오 챗봇에서 전달받은 json을 파싱
  //? supabase db에서 사용자 및 어시스턴트, 스레드 id 조회.
  //? 카카오 서버에는 usecallback 리턴을 날림(마지막)
  //? openai에 대화 내용 던짐.
  //? 받은 내용 db에 저장. callbackUrl로 받은 내용 전송

  //* 카톡 처리 때문에 대부분의 처리는 여기서 비동기로 작업한다.
  getAssistantMessage(req);
  

  //* useCallback 메세지를 카톡 서버에 전송
  await new Promise((resolve) => setTimeout(resolve, 1000));
  // const webhookText = JSON.stringify(await req.json());
  const webhookText = "잠시만 기다려주시겠어요? 고심해서 답변을 작성중이에요.";
  return Response.json(getUseCallbackResponse(webhookText));
})

//* 카톡 useCallback 신호 전송용 응답 개체 생성
const getUseCallbackResponse = (webhookText: string) => {
  const response = {
    version: "2.0",
    useCallback: true,
    data: { text: webhookText, }};
  return response;
}

//* 카톡 callbackUrl에 최종 응답 전송
const sendCallbackResponse = async (reply: string, callbackUrl: string) => {
  // await new Promise((resolve) => setTimeout(resolve, 5000));
  const response = {
    version: "2.0",
    template: { outputs: [{ simpleText: { text: reply } }] }
  };
  await fetch(callbackUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json", },
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

  if (!callbackUrl || !utterance) {
    await sendCallbackResponse("카카오톡에서 오류가 발생했어요. 문제를 해결할 때까지 잠시 기다려 주세요", callbackUrl);
    return;
  }

  try {
    //* supabase 연결 및 관련된 호출 처리
    //* openai 호출 부분
    // Documentation here: https://github.com/openai/openai-node
    const supabase = createClient<Database>(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    );

    //* db에서 botId와 연관되는 assistant를 찾고, botUserKey의 최신 thread를 찾고, 오늘 message갯수를 리턴
    const { data, error } = await supabase
      .rpc('get_kakao_atmc', {
        _kakao_bot_id: botId,
        _user_id: botUserKey
      }).single();
    
    const userInfo = data;
    if (!userInfo?._assistant_id || error) {
      throw Error('앗! 도담이가 아파요. 나을 때까지 잠시 기다려주세요.')
    }
    if (userInfo?.today_message_count > limitMessagesPerDay) {
      throw Error("오늘 너무 많은 대화를 한 것 같아요. 내일 다시 만나서 이야기해요.");
    }

    //* openai와 접속해서 스레드 연결 혹은 생성 및 db에 저장
    const openai = new OpenAI({
      apiKey: Deno.env.get('OPENAI_API_KEY'),
    });
    let thread;
    if (userInfo?._thread_id) {
      thread = await openai.beta.threads.retrieve(userInfo?._thread_id);
    } else {
      thread = await openai.beta.threads.create();
      const { error }=  await supabase.from('threads').insert({
        thread_id: thread.id,
        assistant_id: userInfo?._assistant_id,
        user_id: botUserKey
      });
      if (error) {
        throw error;
      }
    }

    //* 새 메세지 객체 생성
    const userMessage = await openai.beta.threads.messages.create(
      thread.id, {
      role: "user",
      content: utterance
    });

    //* 새 답변 생성
    const run = await openai.beta.threads.runs.createAndPoll(
      thread.id, {
      assistant_id: userInfo?._assistant_id,
    });
    
    //* 확인 후 db 저장 및 카톡 callbackUrl에 답변 전송
    //todo 사용자 메세지와 assistant 메세지 db 저장 구현
    if (run.status === 'completed') {
      const messages = await openai.beta.threads.messages.list(
        run.thread_id, {
        // order: 'desc',
        // limit:1,
        // after:message.id, 
        run_id: run.id
      });
      const assistantMessage = messages.data[0];
      if (assistantMessage.content[0].type == "text") {
        const { error } = await supabase.from('messages').insert({
          user_id: botUserKey,
          thread_id: assistantMessage.thread_id,
          assistant_id: assistantMessage.assistant_id!,
          user_message_id: userMessage.id,
          user_message: (userMessage.content[0] as TextContentBlock).text.value,
          assistant_message_id: assistantMessage.id,
          assistant_message: (assistantMessage.content[0] as TextContentBlock).text.value
        });
        if (error) {
          throw error;
        }
        const assistantMessageText = (assistantMessage.content[0] as TextContentBlock).text.value;

        await sendCallbackResponse(assistantMessageText, callbackUrl);
      }
    } else {
      throw Error(run.status);
    }
  } catch (err:any) {
    //* openai error message insert error while run is runing
    if (err.message.startsWith("400"))
        await sendCallbackResponse('방금 전 대화에 대한 답변을 아직 생각중이에요. 조금 더 기다려주세요.', callbackUrl);
    else
      await sendCallbackResponse(err.message, callbackUrl);
    //"오류가 발생했어요. 문제를 해결할 때까지 잠시 기다려 주세요"
  }
};