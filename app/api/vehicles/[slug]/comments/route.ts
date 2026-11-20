import { NextRequest, NextResponse } from 'next/server';
import { getVehicleComments, addComment, getVehicleBySlug } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth-helpers';

export async function GET(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const slug = params.slug;
    const vehicle = getVehicleBySlug(slug);
    if (!vehicle) {
      return NextResponse.json({ error: 'Vehicle not found' }, { status: 404 });
    }

    const comments = getVehicleComments(slug);
    return NextResponse.json({ comments });
  } catch (err: any) {
    return NextResponse.json({ error: 'Failed to retrieve comments' }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const slug = params.slug;
    const vehicle = getVehicleBySlug(slug);
    if (!vehicle) {
      return NextResponse.json({ error: 'Vehicle not found' }, { status: 404 });
    }

    const user = getCurrentUser(req);
    if (!user) {
      return NextResponse.json(
        {
          ok: false,
          error: 'Please log in with your Secret Key ID to leave a comment.',
          requiresAuth: true,
        },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { content } = body;

    if (!content || typeof content !== 'string' || content.trim().length === 0) {
      return NextResponse.json({ error: 'Comment content cannot be empty.' }, { status: 400 });
    }

    if (content.length > 1000) {
      return NextResponse.json({ error: 'Comment must be 1,000 characters or less.' }, { status: 400 });
    }

    const newComment = addComment(slug, user.handle, content.trim());
    return NextResponse.json({ ok: true, comment: newComment });
  } catch (err: any) {
    console.error('Error posting comment:', err);
    return NextResponse.json({ error: 'Failed to save comment' }, { status: 500 });
  }
}
