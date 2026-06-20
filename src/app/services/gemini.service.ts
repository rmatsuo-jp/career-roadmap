/**
 * @file Google Gemini API との通信を担うサービス。
 * generate() でプロンプトを送信しテキスト応答を返す。
 * gemini-3.5-flash でエラーが発生した場合は gemini-2.5-flash に自動フォールバックする。
 */
import { Injectable } from '@angular/core';
import { GoogleGenerativeAI } from '@google/generative-ai';

@Injectable({ providedIn: 'root' })
export class GeminiService {
  // ── テキスト生成（gemini-3.5-flash 失敗時は gemini-2.5-flash にフォールバック） ─
  async generate(apiKey: string, model: string, prompt: string): Promise<string> {
    try {
      return await this.callApi(apiKey, model, prompt);
    } catch (e) {
      if (model === 'gemini-3.5-flash') {
        return await this.callApi(apiKey, 'gemini-2.5-flash', prompt);
      }
      throw e;
    }
  }

  private async callApi(apiKey: string, model: string, prompt: string): Promise<string> {
    const genAI = new GoogleGenerativeAI(apiKey);
    const genModel = genAI.getGenerativeModel({ model });
    const result = await genModel.generateContent(prompt);
    return result.response.text().trim();
  }
}
