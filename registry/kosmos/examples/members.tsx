'use client';

import { DataSetPreview } from '@/components/preview/data-set-preview';
import { PreviewSection, PreviewStack } from '@/components/preview/preview-section';
import { Members, type Invite, type Member } from '@/registry/kosmos/blocks/members/members';

const frame = 'w-full rounded-xl border border-transparent bg-background p-4 shadow-card';

const owner: Member = { id: 'lena', name: 'Lena Park', email: 'lena@acme.example', role: 'owner', status: 'active', lastActive: 'Just now' };
const longMembers: Member[] = [
  owner,
  {
    id: 'long',
    name: 'Alexandra Konstantinopoulou-Papadimitriou for the Growth and Platform teams',
    email: 'alexandra.konstantinopoulou-papadimitriou.with.a.very.long.address@subdomain.example-company.example',
    role: 'admin',
    status: 'active',
    lastActive: '3 minutes ago',
  },
  { id: 'cjk', name: '山田 太郎', email: 'taro.yamada@acme.example', role: 'member', status: 'active', lastActive: 'Yesterday' },
  { id: 'one', name: 'Q', email: 'q@a.co', role: 'viewer' },
  { id: 'emoji', name: '🚀 Rocket Ops', email: 'rocket.ops@acme.example', role: 'member', status: 'suspended', lastActive: 'Sep 12' },
  { id: 'rtl', name: 'ليلى بنت عبد الرحمن الفاسي', email: 'layla@acme.example', role: 'member', status: 'active', lastActive: '1,284 days ago' },
  { id: 'dash', name: 'Ana-Sofía de la Cruz y Fernández-Valdés', email: 'ana@acme.example', role: 'viewer', status: 'active' },
];
const longInvites: Invite[] = [
  {
    id: 'a',
    email: 'someone.with.an.unbreakable.address.that.keeps.going@a-really-long-company-domain-name.example',
    role: 'viewer',
    sentLabel: 'Alexandra Konstantinopoulou-Papadimitriou, Oct 9',
    status: 'expired',
  },
];

export default function MembersPreview() {
  return <DataSetPreview demo={<Demo />} worst={<Worst />} />;
}

function Demo() {
  return (
    <PreviewStack>
      <PreviewSection title="Full">
        <div className={frame}>
          <Members />
        </div>
      </PreviewSection>

      <PreviewSection title="Loading">
        <div className={frame}>
          <Members loading />
        </div>
      </PreviewSection>

      <PreviewSection title="Only the owner, no invites">
        <div className={frame}>
          <Members members={[owner]} invites={[]} />
        </div>
      </PreviewSection>

      <PreviewSection title="In a narrow container">
        <div className={`${frame} max-w-sm`}>
          <Members />
        </div>
      </PreviewSection>
    </PreviewStack>
  );
}

function Worst() {
  return (
    <PreviewStack>
      <PreviewSection title="Long names, non-Latin text, unbreakable emails">
        <div className={frame}>
          <Members workspace="Acme Staging, the Europe and Middle East data region" members={longMembers} invites={longInvites} />
        </div>
      </PreviewSection>

      <PreviewSection title="Worst case in a narrow container">
        <div className={`${frame} max-w-sm`}>
          <Members workspace="Acme Staging, the Europe and Middle East data region" members={longMembers} invites={longInvites} />
        </div>
      </PreviewSection>
    </PreviewStack>
  );
}
