"use server";

import { WATERMARK } from "@/shared/shared";
import { ZResult, err, getErrorMessage, succ } from "@/shared/util";
import { PopupActionResult } from "@pcd/passport-interface";
import { ETHBERLIN04 } from "@pcd/zuauth";
import { authenticate } from "@pcd/zuauth/server";
import { makePodTweet, saveTweet } from "./tweets";
import { makeAndSaveToken } from "./users";
import { getTokenUser } from "./users";

export interface AuthResult {
  token: string;
}

export interface Post {
  title: string;
  imageUrl: string;
  content: string;
}

export async function auth(
  result: PopupActionResult
): Promise<ZResult<AuthResult>> {
  if (result.type !== "pcd") {
    return err("wrong result type");
  }

  try {
    const pcd = await authenticate(result.pcdStr, WATERMARK.toString(), [
      {
        eventName: "0xPARC Summer",
        pcdType: "eddsa-ticket-pcd",
        publicKey: ETHBERLIN04[0].publicKey,
        productName: "Superuser",
        productId: "324e7d6b-e0af-416c-b27a-1d091a156ca5",
        eventId: "654a38cd-de57-4093-9d21-5418e217db1e"
      }
    ]);
    return succ({ token: await makeAndSaveToken(pcd) });
  } catch (e) {
    return err("authentication failed: " + getErrorMessage(e));
  }
}

export async function createPost(
  token: string,
  post: Post
): Promise<ZResult<Post>> {
  const user = await getTokenUser(token);

  if (!user) {
    return err("invalid token");
  }

  const commitment = user.claim.partialTicket.attendeeSemaphoreId;

  if (!commitment) {
    return err("user has no commitment");
  }

  await saveTweet(await makePodTweet(post, commitment));

  return succ(post);
}
