/**
 * Клиент API base.sstmk.ru (см. docs/api/API_base.docx).
 *
 * - POST на API_URL, данные form-urlencoded
 * - авторизация: login + md5(pass)
 * - методы: get_main_categories, get_all_categories, get_fields, get_goods_by_cat_id
 */

import { createHash } from "crypto";

export type ApiCategory = { id: string; name: string; parent: string };

/** Товар API — набор строковых полей (общие + характеристики) */
export type ApiGood = Record<string, string>;

export type ApiFieldMap = Record<string, string>;

type ApiError = { error_code: string; error_title: string };

export class BaseApiError extends Error {}

export class BaseApiClient {
  constructor(
    private readonly login: string,
    private readonly pass: string,
    private readonly apiUrl: string,
    private readonly retries = 3
  ) {}

  private async request(
    params: Record<string, string>,
    attempt = 1
  ): Promise<unknown> {
    const body = new URLSearchParams({
      login: this.login,
      pass: createHash("md5").update(this.pass).digest("hex"),
      ...params,
    });

    let res: Response;
    try {
      res = await fetch(this.apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: body.toString(),
        signal: AbortSignal.timeout(120_000),
      });
    } catch (e) {
      if (attempt < this.retries) {
        await new Promise((r) => setTimeout(r, 2000 * attempt));
        return this.request(params, attempt + 1);
      }
      throw new BaseApiError(
        `Сетевая ошибка при запросе ${params.action}: ${String(e)}`
      );
    }

    if (!res.ok) {
      if (attempt < this.retries && res.status >= 500) {
        await new Promise((r) => setTimeout(r, 2000 * attempt));
        return this.request(params, attempt + 1);
      }
      throw new BaseApiError(
        `API вернул HTTP ${res.status} для ${params.action}`
      );
    }

    const text = await res.text();
    let data: unknown;
    try {
      data = JSON.parse(text);
    } catch {
      throw new BaseApiError(
        `Не удалось разобрать ответ API для ${params.action}: ${text.slice(0, 200)}`
      );
    }

    if (
      data &&
      !Array.isArray(data) &&
      typeof data === "object" &&
      "error_code" in (data as ApiError)
    ) {
      const err = data as ApiError;
      throw new BaseApiError(
        `Ошибка API ${err.error_code}: ${err.error_title} (${params.action})`
      );
    }

    return data;
  }

  /** Основные категории (типы объектов: ИБП, АКБ, ...) */
  async getMainCategories(): Promise<ApiCategory[]> {
    return (await this.request({ action: "get_main_categories" })) as ApiCategory[];
  }

  /** Полное дерево категорий, вложенность по parent */
  async getAllCategories(): Promise<ApiCategory[]> {
    return (await this.request({ action: "get_all_categories" })) as ApiCategory[];
  }

  /** Описание характеристик объектов категории: { field: "Подпись" } */
  async getFields(catId: number | string): Promise<ApiFieldMap> {
    return (await this.request({
      action: "get_fields",
      cat_id: String(catId),
    })) as ApiFieldMap;
  }

  /** Объекты категории (до 500 за запрос, offset не поддерживается) */
  async getGoodsByCatId(catId: number | string): Promise<ApiGood[]> {
    return (await this.request({
      action: "get_goods_by_cat_id",
      cat_id: String(catId),
    })) as ApiGood[];
  }
}
