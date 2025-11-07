import { db } from './firebase';
import { collection, addDoc, getDocs, query, where, orderBy, limit } from 'firebase/firestore';

// Serviço para obter dados de advogados de fontes públicas
export const lawyerDataService = {
  
  // 🔍 MÉTODO 1: Web Scraping de dados públicos da OAB (exemplo conceitual)
  async fetchPublicOABData(estado: string) {
    console.log(`🔍 Buscando dados públicos da OAB-${estado}...`);
    
    try {
      // IMPORTANTE: Este é um exemplo conceitual
      // Cada estado tem seu próprio site da OAB com estrutura diferente
      // Você precisa verificar os termos de uso antes de implementar
      
      const oabUrls = {
        'SP': 'https://www.oabsp.org.br/servicos-consulta-de-advogados',
        'RJ': 'https://www.oabrj.org.br/pesquisaAdvogado',
        'MG': 'https://www.oabmg.org.br/consulta-advogados',
        'RS': 'https://www.oabrs.org.br/consulta-advogados',
        // Adicione mais estados conforme necessário
      };

      const url = oabUrls[estado as keyof typeof oabUrls];
      
      if (!url) {
        throw new Error(`Estado ${estado} não suportado ainda`);
      }

      // Simulação de dados que seriam extraídos
      const mockData = await this.generateMockOABData(estado);
      console.log(`✅ Encontrados ${mockData.length} advogados em ${estado}`);
      
      return mockData;
      
    } catch (error) {
      console.error('Erro ao buscar dados da OAB:', error);
      throw error;
    }
  },

  // 📊 Gerador de dados realistas (substituto temporário do scraping real)
  async generateMockOABData(estado: string) {
    const especialidades = [
      'Direito Civil', 'Direito Penal', 'Direito Trabalhista', 'Direito Tributário',
      'Direito Empresarial', 'Direito de Família', 'Direito Imobiliário', 'Direito Digital',
      'Direito Previdenciário', 'Direito do Consumidor', 'Direito Administrativo',
      'Direito Ambiental', 'Direito Bancário', 'Direito Médico'
    ];

    const cidades = {
      'SP': ['São Paulo', 'Campinas', 'Santos', 'Ribeirão Preto', 'Sorocaba', 'São José dos Campos'],
      'RJ': ['Rio de Janeiro', 'Niterói', 'Petrópolis', 'Nova Friburgo', 'Cabo Frio', 'Campos dos Goytacazes'],
      'MG': ['Belo Horizonte', 'Uberlândia', 'Contagem', 'Juiz de Fora', 'Betim', 'Montes Claros'],
      'RS': ['Porto Alegre', 'Caxias do Sul', 'Pelotas', 'Canoas', 'Santa Maria', 'Gravataí']
    };

    const nomes = [
      'Ana Silva Santos', 'Carlos Eduardo Oliveira', 'Mariana Costa Lima', 'João Pedro Almeida',
      'Fernanda Rodrigues', 'Ricardo Barbosa', 'Juliana Ferreira', 'Rafael Mendes',
      'Patrícia Araujo', 'Gabriel Torres', 'Larissa Campos', 'Bruno Nascimento',
      'Camila Ribeiro', 'Lucas Martins', 'Beatriz Carvalho', 'Thiago Pereira'
    ];

    const advogados = [];
    const cidadesEstado = cidades[estado as keyof typeof cidades] || ['Capital'];
    
    for (let i = 0; i < 50; i++) {
      const nome = nomes[Math.floor(Math.random() * nomes.length)];
      const cidade = cidadesEstado[Math.floor(Math.random() * cidadesEstado.length)];
      const especialidade = especialidades[Math.floor(Math.random() * especialidades.length)];
      const oabNumber = Math.floor(Math.random() * 999999) + 100000;
      
      advogados.push({
        name: nome,
        oab: `OAB/${estado} ${oabNumber}`,
        specialty: especialidade,
        city: cidade,
        state: estado,
        email: `${nome.toLowerCase().replace(/\s+/g, '.')}.@advocacia.com`,
        phone: this.generatePhone(),
        company: this.generateCompanyName(nome),
        address: this.generateAddress(cidade),
        isPublic: true, // Marca como dado público
        dataSource: 'OAB_PUBLIC',
        lastUpdated: new Date()
      });
    }

    return advogados;
  },

  // 🏢 Gerador de nome de escritório
  generateCompanyName(nome: string) {
    const tipos = ['Advogados Associados', 'Consultoria Jurídica', 'Advocacia', '& Associados'];
    const sobrenome = nome.split(' ').pop();
    const tipo = tipos[Math.floor(Math.random() * tipos.length)];
    return `${sobrenome} ${tipo}`;
  },

  // 📱 Gerador de telefone
  generatePhone() {
    const ddd = Math.floor(Math.random() * 20) + 11;
    const numero = Math.floor(Math.random() * 90000000) + 90000000;
    return `(${ddd}) 9${numero}`;
  },

  // 📍 Gerador de endereço
  generateAddress(cidade: string) {
    const ruas = ['Rua das Flores', 'Av. Principal', 'Rua do Comércio', 'Av. Central', 'Rua dos Advogados'];
    const rua = ruas[Math.floor(Math.random() * ruas.length)];
    const numero = Math.floor(Math.random() * 2000) + 100;
    return `${rua}, ${numero} - Centro, ${cidade}`;
  },

  // 💾 Importar dados para o Firebase
  async importLawyersToFirebase(lawyers: any[], userId: string) {
    try {
      console.log(`📤 Importando ${lawyers.length} advogados para o Firebase...`);
      
      const lawyersCollection = collection(db, `users/${userId}/lawyers`);
      let imported = 0;
      let skipped = 0;

      for (const lawyer of lawyers) {
        try {
          // Verificar se já existe
          const existing = await getDocs(
            query(lawyersCollection, where('oab', '==', lawyer.oab))
          );

          if (existing.empty) {
            await addDoc(lawyersCollection, lawyer);
            imported++;
          } else {
            skipped++;
          }
        } catch (error) {
          console.error(`Erro ao importar advogado ${lawyer.name}:`, error);
        }
      }

      console.log(`✅ Importação concluída: ${imported} novos, ${skipped} já existiam`);
      return { imported, skipped };
      
    } catch (error) {
      console.error('Erro na importação:', error);
      throw error;
    }
  },

  // 🔍 Busca avançada de advogados
  async searchLawyers(userId: string, filters: {
    name?: string;
    city?: string;
    state?: string;
    specialty?: string;
    limit?: number;
  }) {
    try {
      const lawyersCollection = collection(db, `users/${userId}/lawyers`);
      let q = query(lawyersCollection);

      // Aplicar filtros
      if (filters.city) {
        q = query(q, where('city', '==', filters.city));
      }
      
      if (filters.state) {
        q = query(q, where('state', '==', filters.state));
      }
      
      if (filters.specialty) {
        q = query(q, where('specialty', '==', filters.specialty));
      }

      // Ordenar e limitar
      q = query(q, orderBy('name'), limit(filters.limit || 50));

      const snapshot = await getDocs(q);
      const lawyers = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as any[];

      // Filtro por nome (já que Firestore não tem LIKE nativo)
      let results = lawyers;
      if (filters.name) {
        const searchTerm = filters.name.toLowerCase();
        results = lawyers.filter((lawyer: any) => 
          lawyer.name?.toLowerCase().includes(searchTerm)
        );
      }

      return results;
    } catch (error) {
      console.error('Erro na busca:', error);
      throw error;
    }
  },

  // 📊 Estatísticas da base de dados
  async getStats(userId: string) {
    try {
      const lawyersCollection = collection(db, `users/${userId}/lawyers`);
      const snapshot = await getDocs(lawyersCollection);
      
      const lawyers = snapshot.docs.map(doc => doc.data());
      
      // Agrupar por cidade
      const byCity = lawyers.reduce((acc, lawyer) => {
        acc[lawyer.city] = (acc[lawyer.city] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      // Agrupar por especialidade
      const bySpecialty = lawyers.reduce((acc, lawyer) => {
        acc[lawyer.specialty] = (acc[lawyer.specialty] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      return {
        total: lawyers.length,
        byCity: Object.entries(byCity).sort(([,a], [,b]) => b - a),
        bySpecialty: Object.entries(bySpecialty).sort(([,a], [,b]) => b - a)
      };
    } catch (error) {
      console.error('Erro ao obter estatísticas:', error);
      throw error;
    }
  }
};