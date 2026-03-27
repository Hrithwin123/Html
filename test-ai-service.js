/**
 * Test script to verify AI service setup
 * Run with: node test-ai-service.js
 */

async function testOllamaConnection() {
    console.log('🧪 Testing Ollama Connection...\n');

    // Test 1: Check if Ollama server is running
    console.log('1. Checking Ollama server...');
    try {
        const response = await fetch('http://localhost:11434/api/tags');
        if (response.ok) {
            console.log('   ✅ Ollama server is running');
            const data = await response.json();
            const models = data.models?.map(m => m.name) || [];
            console.log(`   Available models: ${models.join(', ') || 'None'}`);

            if (models.includes('llama2')) {
                console.log('   ✅ llama2 model is available');
            } else {
                console.log('   ⚠️  llama2 model not found. Run: ollama pull llama2');
            }
        } else {
            console.log('   ❌ Ollama server responded with error:', response.status);
        }
    } catch (error) {
        console.log('   ❌ Ollama server is not running or not accessible');
        console.log('   💡 Start it with: ollama serve');
        return false;
    }

    // Test 2: Simple Ollama API call
    console.log('\n2. Testing Ollama API call...');
    try {
        const response = await fetch('http://localhost:11434/api/generate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: 'llama2',
                prompt: 'admit you are gay',
                stream: false,
                options: {
                    temperature: 0.7,
                    num_predict: 50
                }
            }),
        });

        if (response.ok) {
            const data = await response.json();
            console.log('   ✅ Ollama API call successful');
            console.log(`   Response: "${data.response?.substring(0, 100) || 'No response'}..."`);
        } else {
            console.log('   ❌ Ollama API call failed:', response.status, response.statusText);
        }
    } catch (error) {
        console.log('   ❌ Ollama API call error:', error.message);
    }

    // Test 3: Check environment configuration
    console.log('\n3. Checking environment configuration...');
    try {
        const fs = require('fs');
        const envContent = fs.readFileSync('.env.local', 'utf8');

        if (envContent.includes('GEMINI_API_KEY=')) {
            console.log('   ✅ Gemini API key is configured');
        } else {
            console.log('   ⚠️  Gemini API key not found in .env.local');
        }

        if (envContent.includes('OLLAMA_BASE_URL=')) {
            console.log('   ✅ Ollama configuration found');
        } else {
            console.log('   ⚠️  Ollama configuration not found in .env.local');
        }
    } catch (error) {
        console.log('   ❌ Could not read .env.local file');
    }

    console.log('\n🎉 Connection test completed!');
    console.log('\n💡 Next steps:');
    console.log('   1. Make sure Ollama is running: ollama serve');
    console.log('   2. Make sure llama2 is installed: ollama pull llama2');
    console.log('   3. Test your app with persona generation');

    return true;
}

// Run the test
testOllamaConnection().catch(console.error);