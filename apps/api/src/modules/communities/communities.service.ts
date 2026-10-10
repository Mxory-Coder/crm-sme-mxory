import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Community, CommunityPost, CommunityPostComment } from './community.entities';

@Injectable()
export class CommunitiesService {
  constructor(
    @InjectRepository(Community) private readonly communityRepo: Repository<Community>,
    @InjectRepository(CommunityPost) private readonly postRepo: Repository<CommunityPost>,
    @InjectRepository(CommunityPostComment) private readonly commentRepo: Repository<CommunityPostComment>,
  ) {}

  // ─── Communities ──────────────────────────────────────────────────────────

  async findAll(locationId: string): Promise<Community[]> {
    return this.communityRepo.find({ where: { locationId }, order: { createdAt: 'DESC' } });
  }

  async findById(locationId: string, id: string): Promise<Community> {
    const c = await this.communityRepo.findOne({ where: { id, locationId } });
    if (!c) throw new NotFoundException('Community not found');
    return c;
  }

  async create(locationId: string, dto: Partial<Community>): Promise<Community> {
    return this.communityRepo.save(this.communityRepo.create({ ...dto, locationId }));
  }

  async update(locationId: string, id: string, dto: Partial<Community>): Promise<Community> {
    const c = await this.findById(locationId, id);
    Object.assign(c, dto);
    return this.communityRepo.save(c);
  }

  async delete(locationId: string, id: string): Promise<void> {
    const c = await this.findById(locationId, id);
    await this.communityRepo.remove(c);
  }

  // ─── Posts ────────────────────────────────────────────────────────────────

  async findPosts(locationId: string, communityId: string, page = 1): Promise<CommunityPost[]> {
    await this.findById(locationId, communityId);
    return this.postRepo.find({
      where: { communityId, locationId },
      order: { isPinned: 'DESC', createdAt: 'DESC' },
      take: 20,
      skip: (page - 1) * 20,
    });
  }

  async createPost(locationId: string, communityId: string, body: string, mediaUrls: string[], authorId: string, isContact: boolean): Promise<CommunityPost> {
    await this.findById(locationId, communityId);
    const post = this.postRepo.create({
      communityId,
      locationId,
      body,
      mediaUrls,
      contactId: isContact ? authorId : null,
      userId: isContact ? null : authorId,
    });
    const saved = await this.postRepo.save(post);
    await this.communityRepo.increment({ id: communityId }, 'postCount', 1);
    return saved;
  }

  async deletePost(locationId: string, postId: string): Promise<void> {
    const post = await this.postRepo.findOne({ where: { id: postId, locationId } });
    if (!post) throw new NotFoundException('Post not found');
    await this.postRepo.remove(post);
    await this.communityRepo.decrement({ id: post.communityId }, 'postCount', 1);
  }

  async pinPost(locationId: string, postId: string, pinned: boolean): Promise<CommunityPost> {
    const post = await this.postRepo.findOne({ where: { id: postId, locationId } });
    if (!post) throw new NotFoundException('Post not found');
    post.isPinned = pinned;
    return this.postRepo.save(post);
  }

  // ─── Comments ─────────────────────────────────────────────────────────────

  async findComments(locationId: string, postId: string): Promise<CommunityPostComment[]> {
    return this.commentRepo.find({ where: { postId, locationId }, order: { createdAt: 'ASC' } });
  }

  async createComment(locationId: string, postId: string, body: string, authorId: string, isContact: boolean): Promise<CommunityPostComment> {
    const post = await this.postRepo.findOne({ where: { id: postId, locationId } });
    if (!post) throw new NotFoundException('Post not found');
    const comment = this.commentRepo.create({
      postId,
      locationId,
      body,
      contactId: isContact ? authorId : null,
      userId: isContact ? null : authorId,
    });
    const saved = await this.commentRepo.save(comment);
    await this.postRepo.increment({ id: postId }, 'commentCount', 1);
    return saved;
  }

  async deleteComment(locationId: string, commentId: string): Promise<void> {
    const comment = await this.commentRepo.findOne({ where: { id: commentId, locationId } });
    if (!comment) throw new NotFoundException('Comment not found');
    await this.commentRepo.remove(comment);
    await this.postRepo.decrement({ id: comment.postId }, 'commentCount', 1);
  }
}
