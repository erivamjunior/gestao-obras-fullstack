'use client';

import { useEffect, useMemo, useState } from 'react';
import { Authenticator, Button, Heading } from '@aws-amplify/ui-react';
import { uploadData, getUrl, remove } from 'aws-amplify/storage';
import { configureAmplify, client } from '@/lib/amplify-client';
import { obterPapelUsuario, podeEditar, podeExcluir, type Papel } from '@/lib/permissions';

type Obra = {
  id: string;
  nome: string;
  cliente: string;
  status?: string | null;
  dataInicio: string;
};

type Documento = {
  id: string;
  nomeArquivo: string;
  caminhoStorage: string;
  obraId: string;
};

configureAmplify();

export default function HomePage() {
  const [papel, setPapel] = useState<Papel>('SEM_GRUPO');
  const [obras, setObras] = useState<Obra[]>([]);
  const [documentos, setDocumentos] = useState<Documento[]>([]);
  const [loading, setLoading] = useState(false);

  const [novaObra, setNovaObra] = useState({
    nome: '',
    cliente: '',
    dataInicio: new Date().toISOString().slice(0, 10),
    status: 'PLANEJAMENTO',
  });

  const [arquivo, setArquivo] = useState<File | null>(null);
  const [obraDocumento, setObraDocumento] = useState('');

  const obraMap = useMemo(() => new Map(obras.map((o) => [o.id, o])), [obras]);

  async function carregarTudo() {
    setLoading(true);
    const [papelAtual, obrasResp, docsResp] = await Promise.all([
      obterPapelUsuario(),
      client.models.Obra.list(),
      client.models.Documento.list(),
    ]);

    setPapel(papelAtual);
    setObras((obrasResp.data ?? []) as Obra[]);
    setDocumentos((docsResp.data ?? []) as Documento[]);
    setLoading(false);
  }

  useEffect(() => {
    carregarTudo();
  }, []);

  async function criarObra(event: React.FormEvent) {
    event.preventDefault();
    if (!podeEditar(papel)) return;

    await client.models.Obra.create({
      nome: novaObra.nome,
      cliente: novaObra.cliente,
      dataInicio: novaObra.dataInicio,
      status: novaObra.status as 'PLANEJAMENTO' | 'EM_ANDAMENTO' | 'PAUSADA' | 'CONCLUIDA',
    });

    setNovaObra({
      nome: '',
      cliente: '',
      dataInicio: new Date().toISOString().slice(0, 10),
      status: 'PLANEJAMENTO',
    });

    await carregarTudo();
  }

  async function excluirObra(id: string) {
    if (!podeExcluir(papel)) return;
    await client.models.Obra.delete({ id });
    await carregarTudo();
  }

  async function uploadDocumento(event: React.FormEvent) {
    event.preventDefault();
    if (!arquivo || !obraDocumento || !podeEditar(papel)) return;

    const caminhoStorage = `obras/${obraDocumento}/${Date.now()}-${arquivo.name}`;

    await uploadData({
      path: caminhoStorage,
      data: arquivo,
      options: {
        contentType: arquivo.type,
      },
    }).result;

    await client.models.Documento.create({
      nomeArquivo: arquivo.name,
      caminhoStorage,
      tipoMime: arquivo.type,
      tamanhoBytes: arquivo.size,
      obraId: obraDocumento,
    });

    setArquivo(null);
    await carregarTudo();
  }

  async function baixarDocumento(caminhoStorage: string) {
    const { url } = await getUrl({ path: caminhoStorage });
    window.open(url.toString(), '_blank', 'noopener,noreferrer');
  }

  async function excluirDocumento(documento: Documento) {
    if (!podeExcluir(papel)) return;

    await remove({ path: documento.caminhoStorage });
    await client.models.Documento.delete({ id: documento.id });
    await carregarTudo();
  }

  return (
    <Authenticator>
      {({ signOut, user }) => (
        <main>
          <div className="card">
            <Heading level={2}>Gestão de Obras</Heading>
            <p>
              Usuário autenticado: <strong>{user?.signInDetails?.loginId ?? user?.username}</strong>
            </p>
            <p>
              Papel detectado (grupos Cognito): <strong>{papel}</strong>
            </p>
            <Button onClick={signOut}>Sair</Button>
          </div>

          <div className="card">
            <h3>Nova obra</h3>
            <p className="small">Somente ADMIN e ENGENHEIRO podem criar.</p>
            <form onSubmit={criarObra} className="grid">
              <input
                placeholder="Nome da obra"
                value={novaObra.nome}
                onChange={(e) => setNovaObra((s) => ({ ...s, nome: e.target.value }))}
                required
              />
              <input
                placeholder="Cliente"
                value={novaObra.cliente}
                onChange={(e) => setNovaObra((s) => ({ ...s, cliente: e.target.value }))}
                required
              />
              <input
                type="date"
                value={novaObra.dataInicio}
                onChange={(e) => setNovaObra((s) => ({ ...s, dataInicio: e.target.value }))}
                required
              />
              <select
                value={novaObra.status}
                onChange={(e) => setNovaObra((s) => ({ ...s, status: e.target.value }))}
              >
                <option value="PLANEJAMENTO">Planejamento</option>
                <option value="EM_ANDAMENTO">Em andamento</option>
                <option value="PAUSADA">Pausada</option>
                <option value="CONCLUIDA">Concluída</option>
              </select>
              <button disabled={!podeEditar(papel)} type="submit">
                Criar obra
              </button>
            </form>
          </div>

          <div className="card">
            <h3>Obras cadastradas</h3>
            {loading ? <p>Carregando...</p> : null}
            <table className="table">
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>Cliente</th>
                  <th>Status</th>
                  <th>Início</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {obras.map((obra) => (
                  <tr key={obra.id}>
                    <td>{obra.nome}</td>
                    <td>{obra.cliente}</td>
                    <td>{obra.status ?? '-'}</td>
                    <td>{obra.dataInicio}</td>
                    <td>
                      <div className="actions">
                        <button
                          className="danger"
                          disabled={!podeExcluir(papel)}
                          onClick={() => excluirObra(obra.id)}
                          type="button"
                        >
                          Excluir
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="card">
            <h3>Upload de documentos</h3>
            <p className="small">Os arquivos são persistidos no Amazon S3 via Amplify Storage.</p>
            <form onSubmit={uploadDocumento} className="grid">
              <select
                value={obraDocumento}
                onChange={(e) => setObraDocumento(e.target.value)}
                required
              >
                <option value="">Selecione a obra</option>
                {obras.map((obra) => (
                  <option key={obra.id} value={obra.id}>
                    {obra.nome}
                  </option>
                ))}
              </select>
              <input type="file" onChange={(e) => setArquivo(e.target.files?.[0] ?? null)} required />
              <button disabled={!podeEditar(papel)} type="submit">
                Enviar arquivo
              </button>
            </form>
          </div>

          <div className="card">
            <h3>Documentos</h3>
            <table className="table">
              <thead>
                <tr>
                  <th>Arquivo</th>
                  <th>Obra</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {documentos.map((doc) => (
                  <tr key={doc.id}>
                    <td>{doc.nomeArquivo}</td>
                    <td>{obraMap.get(doc.obraId)?.nome ?? doc.obraId}</td>
                    <td>
                      <div className="actions">
                        <button className="secondary" onClick={() => baixarDocumento(doc.caminhoStorage)} type="button">
                          Download
                        </button>
                        <button
                          className="danger"
                          disabled={!podeExcluir(papel)}
                          onClick={() => excluirDocumento(doc)}
                          type="button"
                        >
                          Excluir
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </main>
      )}
    </Authenticator>
  );
}
